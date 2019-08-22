import {Service} from 'mesg-js/lib/api'

import Command from '../../root-command'
import {IsAlreadyExistsError} from '../../utils/error'

import ServiceCompile from './compile'
import ServiceCreate from './create'
import ServiceDelete from './delete'
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
    description: 'Path or url ([https|mesg]://) of a service',
    default: './'
  }]

  serviceCreated = false
  instanceCreated = false

  async run() {
    const {args, flags} = this.parse(ServiceDev)

    const definition = await ServiceCompile.run([args.SERVICE, '--silent'])
    const serviceHash = await this.createService(definition)
    const instanceHash = await this.startService(serviceHash, flags.env)
    const stream = await ServiceLog.run([instanceHash])

    process.once('SIGINT', async () => {
      stream.destroy()
      if (this.instanceCreated) await ServiceStop.run([instanceHash])
      if (this.serviceCreated) await ServiceDelete.run([serviceHash, '--confirm'])
    })
  }

  async createService(definition: Service): Promise<string> {
    try {
      const service = await this.api.service.create(definition)
      if (!service.hash) throw new Error('invalid hash')
      this.serviceCreated = true
      return service.hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      this.warn('service already created')
      return new IsAlreadyExistsError(e).hash
    }
  }

  async startService(serviceHash: string, env: string[]): Promise<string> {
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
