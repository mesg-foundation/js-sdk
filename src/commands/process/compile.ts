import {flags} from '@oclif/command'
import {existsSync, readFileSync} from 'fs'
import {hash} from 'mesg-js/lib/api/types'
import {dirname, join} from 'path'

import Command from '../../root-command'
import * as compile from '../../utils/compiler'
import {IsAlreadyExistsError} from '../../utils/error'
import ServiceCompile from '../service/compile'

export default class ProcessCompile extends Command {
  static description = 'Compile a process'

  static flags = {
    ...Command.flags,
    dev: flags.boolean({description: 'compile the process and automatically deploy and start all the services'})
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
        throw new Error('"instanceHash" should be present in your process. Use `--dev` to be able to use "service" or "src" attributes.')
      }
      if (instanceObject.service) {
        return this.serviceToInstance(instanceObject.service)
      }
      if (instanceObject.src) {
        return this.sourceToInstance(args.PROCESS_FILE, instanceObject.src)
      }
      throw new Error('at least one of the following parameter should be set: "instanceHash", "service" or "src"')
    })
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  async sourceToInstance(dir: string, src: string): Promise<hash> {
    const directory = join(dirname(dir), src)
    const definition = await ServiceCompile.run([existsSync(directory) ? directory : src, '--silent'])
    let hash: hash
    try {
      const resp = await this.api.service.create(definition)
      if (!resp.hash) throw new Error('invalid hash')
      hash = resp.hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      hash = new IsAlreadyExistsError(e).hash
    }
    if (!hash) throw new Error('hash cannot be empty')
    return this.serviceToInstance(hash)
  }

  async serviceToInstance(sidOrHash: hash | string): Promise<hash> {
    const {services} = await this.api.service.list({})
    if (!services) throw new Error('no services deployed, please deploy your service first')
    const sidOrHashStr = sidOrHash.toString()
    const match = services.filter(x => x.hash && x.hash.toString() === sidOrHashStr || x.sid && x.sid.toString() === sidOrHashStr)
    if (!match || match.length === 0) throw new Error(`cannot find any service with the following: ${sidOrHashStr}`)
    if (match.length > 1) throw new Error(`multiple services match the following sid: ${sidOrHashStr}, provide a service's hash instead`)
    const service = match[0]
    if (!service.hash) throw new Error('invalid service')
    const {instances} = await this.api.instance.list({serviceHash: service.hash})
    if (!instances || instances.length === 0) {
      try {
        const resp = await this.api.instance.create({
          serviceHash: service.hash,
          env: [],
        })
        if (!resp.hash) throw new Error('invalid hash')
        return resp.hash
      } catch (e) {
        if (!IsAlreadyExistsError.match(e)) throw e
        return new IsAlreadyExistsError(e).hash
      }
    }
    if (instances.length > 1) throw new Error('multiple instances match the service, use parameter "instanceHash" instead of "service"')
    const instance = instances[0]
    if (!instance.hash) throw new Error('invalid instance')
    return instance.hash
  }
}
