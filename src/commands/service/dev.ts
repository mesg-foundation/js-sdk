import Command from '../../service-command'

import ServiceDeploy from './deploy'
import ServiceLog from './logs'
import ServiceStart from './start'

export default class ServiceDev extends Command {
  static description = 'Run your service in development mode'

  static flags = {
    ...Command.flags,
    ...ServiceLog.flags,
    ...ServiceDeploy.flags
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDev)

    const envs = (flags.env || []).reduce((prev, value) => [
      ...prev,
      '--env',
      value
    ], [] as string[])
    const serviceID = await ServiceDeploy.run([args.SERVICE_PATH, ...envs])
    await ServiceStart.run([serviceID])
    await ServiceLog.run([serviceID])
    return serviceID
  }
}
