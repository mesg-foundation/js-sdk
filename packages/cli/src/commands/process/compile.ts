import {flags} from '@oclif/command'
import {existsSync, readFileSync} from 'fs'
import {hash} from '@mesg/api/lib/types'
import {dirname, join} from 'path'

import Command from '../../root-command'
import * as compile from '../../utils/compiler'
import {IsAlreadyExistsError} from '../../utils/error'
import ServiceCompile from '../service/compile'

export default class ProcessCompile extends Command {
  static description = 'Compile a process'

  static flags = {
    ...Command.flags,
    dev: flags.boolean({description: 'compile the process and automatically deploy and start all the services'}),
    env: flags.string({
      description: 'Set environment variables',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'PROCESS_FILE',
    description: 'Path of a process file'
  }]

  async run(): Promise<any> {
    const {args, flags} = this.parse(ProcessCompile)
    const definition = await compile.process(readFileSync(args.PROCESS_FILE), async (instanceObject: any) => {
      if (instanceObject.instanceHash) {
        return instanceObject.instanceHash
      }
      if (!flags.dev) {
        throw new Error('"instanceHash" should be present in your process. Use `--dev` to be able to use the "instance" attributes.')
      }
      if (!instanceObject.instance) {
        throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
      }
      const {service, src, env} = instanceObject.instance
      if (service) {
        return this.serviceToInstance(service, env)
      }
      if (src) {
        return this.sourceToInstance(args.PROCESS_FILE, src, env, flags)
      }
      throw new Error('at least one of the following parameter should be set: "instanceHash", "service" or "src"')
    }, (flags.env || []).reduce((prev, env) => ({
      ...prev,
      [env.split('=')[0]]: env.split('=')[1],
    }), {}))
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  async sourceToInstance(dir: string, src: string, env: string[], flags: any): Promise<hash> {
    const directory = join(dirname(dir), src)
    const definition = await ServiceCompile.run([existsSync(directory) ? directory : src, '--silent', ...this.flagsAsArgs(flags)])
    const {hash} = await this.api.service.hash(definition)
    if (!hash) throw new Error('invalid hash')
    const {exists} = await this.api.service.exists({hash})
    if (!exists) {
      const resp = await this.api.service.create(definition)
      if (!resp.hash) throw new Error('invalid hash')
      if (resp.hash.toString() !== hash.toString()) throw new Error('invalid hash')
    }
    return this.serviceToInstance(hash, env)
  }

  async serviceToInstance(sidOrHash: hash | string, env: string[]): Promise<hash> {
    const {services} = await this.api.service.list({})
    if (!services) throw new Error('no services deployed, please deploy your service first')
    const sidOrHashStr = sidOrHash.toString()
    const match = services.filter(x => x.hash && x.hash.toString() === sidOrHashStr || x.sid && x.sid.toString() === sidOrHashStr)
    if (!match || match.length === 0) throw new Error(`cannot find any service with the following: ${sidOrHashStr}`)
    if (match.length > 1) throw new Error(`multiple services match the following sid: ${sidOrHashStr}, provide a service's hash instead`)
    const service = match[0]
    if (!service.hash) throw new Error('invalid service')
    try {
      const resp = await this.api.runner.create({
        serviceHash: service.hash,
        env,
      })
      if (!resp.hash) throw new Error('invalid hash')
      return resp.hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      return new IsAlreadyExistsError(e).hash
    }
  }
}
