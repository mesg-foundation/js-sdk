import {IService} from '@mesg/api/lib/service'
import {hash} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import {IsAlreadyExistsError} from '../../utils/error'

import ServiceCompile from './compile'
import ServiceCreate from './create'
import ServiceLog from './logs'
import ServiceStart from './start'
import ServiceStop from './stop'

export default class ServiceDev extends Command {
  static description = 'Run a service in development mode'

  static flags = {
    ...Command.flags,
    ...ServiceCreate.flags,
    ...ServiceStart.flags,
  }

  static args = [{
    name: 'SERVICE',
    description: 'Path or url of a service',
    default: './'
  }]

  instanceCreated = false

  async run() {
    const {args, flags} = this.parse(ServiceDev)

    this.spinner.start('Starting service')
    this.spinner.status = 'compiling'
    const definition = await ServiceCompile.run([args.SERVICE, '--silent', ...this.flagsAsArgs(flags)])
    this.spinner.status = 'creating service'
    const serviceHash = await this.createService(definition)
    this.spinner.status = 'starting service'
    const instanceHash = await this.startService(serviceHash, flags.env)
    this.spinner.status = 'fetching logs'
    const stream = await ServiceLog.run([base58.encode(instanceHash), ...this.flagsAsArgs(flags)])
    this.spinner.stop(base58.encode(instanceHash))

    process.once('SIGINT', async () => {
      stream.destroy()
      if (this.instanceCreated) await ServiceStop.run([base58.encode(instanceHash), ...this.flagsAsArgs(flags)])
    })
  }

  async createService(definition: IService): Promise<hash> {
    const {hash} = await this.api.service.hash(definition)
    if (!hash) throw new Error('invalid hash')
    const {exists} = await this.api.service.exists({hash})
    if (!exists) {
      const service = await this.api.service.create(definition)
      if (!service.hash) throw new Error('invalid hash')
      if (service.hash.toString() !== hash.toString()) throw new Error('invalid hash')
    }
    return hash
  }

  async startService(serviceHash: hash, env: string[]): Promise<hash> {
    try {
      const instance = await this.api.runner.create({
        serviceHash,
        env
      })
      if (!instance.hash) throw new Error('invalid hash')
      this.instanceCreated = true
      return instance.hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      this.warn('service already started')
      return new IsAlreadyExistsError(e).hash
    }
  }
}
