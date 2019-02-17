import Command from '../../service-command'

export default class ServiceValidate extends Command {
  static description = 'Validate a service file. Check the yml format and rules.'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    // TODO
    const {args, flags} = this.parse(ServiceValidate)

    this.log('validate', args, flags)
  }
}
