import Command from '../../root-command'

import ServiceDelete from './delete'
import ServiceCompile from './compile'
import ServiceCreate from './create';
import InstanceLog, { Log } from '../instance/logs'
import InstanceDelete from '../instance/delete';
import InstanceCreate from '../instance/create';

export default class ServiceDev extends Command {
  static description = 'Run your service in development mode'

  static flags = {
    ...Command.flags,
    ...ServiceCreate.flags,
    ...InstanceCreate.flags,
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const { args, flags } = this.parse(ServiceDev)

    const definition = await ServiceCompile.run([args.SERVICE_PATH, '--silent'])
    const service = await ServiceCreate.run([JSON.stringify(definition)])
    const envs = (flags.env || []).reduce((prev, value) => [...prev, '--env', value], [] as string[])
    const instance = await InstanceCreate.run([service.hash, ...envs])
    const stream = await InstanceLog.run([instance.hash])

    process.on('SIGINT', async () => {
      try {
        await InstanceDelete.run([instance.hash, '--keep-data', '--confirm'])
        await ServiceDelete.run([service.hash, '--confirm'])
      } finally {
        process.exit(0)
      }
    })

    return stream
  }
}
