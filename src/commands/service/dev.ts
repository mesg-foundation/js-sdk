import {Service} from 'mesg-js/lib/api'
import {hash} from 'mesg-js/lib/api/types'
import * as base58 from 'mesg-js/lib/util/base58'

import {WithCredential as Command} from '../../credential-command'
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

    const definition = await ServiceCompile.run([args.SERVICE, '--silent'])
    const serviceHash = await this.createService(definition)
    const instanceHash = await this.startService(serviceHash, flags.env)
    const stream = await ServiceLog.run([base58.encode(instanceHash)])

    process.once('SIGINT', async () => {
      stream.destroy()
      if (this.instanceCreated) await ServiceStop.run([base58.encode(instanceHash)])
    })
  }

  async createService(definition: Service): Promise<hash> {
    const {hash} = await this.api.service.hash(definition)
    if (!hash) throw new Error('invalid hash')
    const {exists} = await this.api.service.exists({hash})
    if (!exists) {
      const service = await this.api.service.create(definition, await this.getCredential())
      if (!service.hash) throw new Error('invalid hash')
      if (service.hash.toString() !== hash.toString()) throw new Error('invalid hash')
    }
    return hash
  }

  async startService(serviceHash: hash, env: string[]): Promise<hash> {
    try {
      const instance = await this.api.instance.create({
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
