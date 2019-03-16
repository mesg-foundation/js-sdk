import Command, {Service} from '../../service-command'

import ServiceDelete from './delete'
import ServiceDeploy from './deploy'

export default class ServiceValidate extends Command {
  static description = 'Validate a service file. Check the yml format and rules.'

  static flags = {
    ...Command.flags,
    ...ServiceDeploy.flags
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceValidate)

    const envs = (flags.env || []).reduce((prev, value) => [
      ...prev,
      '--env',
      value
    ], [] as string[])
    const services = await ServiceDeploy.run([args.SERVICE_PATH, ...envs, '--silent'])
    const hashes = services.map((x: Service) => x.hash)
    await ServiceDelete.run([...hashes, '--keep-data', '--confirm', '--silent'])
  }
}
