import Command, {Service} from '../../service-command'

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
    const services = await ServiceDeploy.run([args.SERVICE_PATH, ...envs])
    const hashes = services.map((x: Service) => x.hash)
    await ServiceStart.run(hashes)
    const stream = await ServiceLog.run(hashes)

    process.on('SIGINT', async () => {
      try {
        await ServiceDelete.run([...hashes, '--keep-data', '--confirm'])
      } finally {
        process.exit(0)
      }
    })

    return stream
  }
}
