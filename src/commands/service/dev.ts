import Command from '../../service-command'

import ServiceDelete from './delete'
import ServiceDeploy from './deploy'
import ServiceLog, {Log} from './logs'
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

  async run(): Promise<Log> {
    const {args, flags} = this.parse(ServiceDev)

    const envs = (flags.env || []).reduce((prev, value) => [
      ...prev,
      '--env',
      value
    ], [] as string[])
    const serviceIDs = await ServiceDeploy.run([args.SERVICE_PATH, ...envs])
    await ServiceStart.run([...serviceIDs])
    const stream = await ServiceLog.run([...serviceIDs])

    process.on('SIGINT', async () => {
      try {
        await ServiceDelete.run([...serviceIDs, '--keep-data', '--confirm'])
      } finally {
        process.exit(0)
      }
    })

    return stream
  }
}
