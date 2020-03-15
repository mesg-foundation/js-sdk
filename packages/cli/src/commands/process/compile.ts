import { flags } from '@oclif/command'
import { IService } from '@mesg/api/lib/service'
import * as base58 from '@mesg/api/lib/util/base58'
import { process as compileProcess } from '@mesg/compiler'
import { existsSync, readFileSync } from 'fs'
import { hash } from '@mesg/api/lib/types'
import { dirname, join } from 'path'

import Command from '../../root-command'
import { IsAlreadyExistsError } from '../../utils/error'
import { IProcess } from '@mesg/api/lib/process-lcd'
import { cli } from 'cli-ux'
import { compileService, ICompileService } from '../../tasks'
import Listr from 'listr'
const ipfsClient = require('ipfs-http-client')

export default class ProcessCompile extends Command {
  static description = 'Compile a process'

  static flags = {
    ...Command.flags,
    dev: flags.boolean({ description: 'compile the process and automatically deploy and start all the services' }),
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

  async run(): Promise<IProcess> {
    const { args, flags } = this.parse(ProcessCompile)
    const definition = await compileProcess(readFileSync(args.PROCESS_FILE), async (instanceObject: any): Promise<string> => {
      if (instanceObject.instanceHash) {
        return instanceObject.instanceHash
      }
      if (!flags.dev) {
        throw new Error('"instanceHash" should be present in your process. Use `--dev` to be able to use the "instance" attributes.')
      }
      if (!instanceObject.instance) {
        throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
      }
      const { service, src, env } = instanceObject.instance
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
    cli.styledJSON(definition)
    return definition
  }

  async sourceToInstance(dir: string, src: string, env: string[], flags: any): Promise<string> {
    const directory = join(dirname(dir), src)

    const tasks = new Listr([compileService])
    const result = await tasks.run({
      path: existsSync(directory) ? directory : src,
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
    })

    const definition = result.definition
    const hash = await this.lcd.service.hash({
      configuration: definition.configuration,
      dependencies: definition.dependencies,
      description: definition.description,
      events: definition.events,
      name: definition.name,
      repository: definition.repository,
      sid: definition.sid,
      source: definition.source,
      tasks: definition.tasks,
    })
    if (!hash) throw new Error('invalid hash')
    const exists = await this.lcd.service.exists(hash)
    if (!exists) {
      const resp = await this.api.service.create(definition)
      if (!resp.hash) throw new Error('invalid hash')
      if (base58.encode(resp.hash) !== hash) throw new Error('invalid hash')
    }
    return this.serviceToInstance(hash, env)
  }

  async serviceToInstance(sidOrHash: string, env: string[]): Promise<string> {
    const services = await this.lcd.service.list()
    if (!services) throw new Error('no services deployed, please deploy your service first')
    const match = services.filter(x => x.hash && x.hash === sidOrHash || x.sid && x.sid === sidOrHash)
    if (!match || match.length === 0) throw new Error(`cannot find any service with the following: ${sidOrHash}`)
    if (match.length > 1) throw new Error(`multiple services match the following sid: ${sidOrHash}, provide a service's hash instead`)
    const service = match[0]
    if (!service.hash) throw new Error('invalid service')

    // get runner
    var runnerHash: hash
    try {
      const { hash } = await this.api.runner.create({
        serviceHash: base58.decode(service.hash),
        env,
      })
      if (!hash) throw new Error('invalid runner created hash')
      runnerHash = hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      runnerHash = new IsAlreadyExistsError(e).hash
    }
    if (!runnerHash) throw new Error('invalid runner hash')
    const runner = await this.lcd.runner.get(base58.encode(runnerHash))
    return runner.instanceHash
  }
}
