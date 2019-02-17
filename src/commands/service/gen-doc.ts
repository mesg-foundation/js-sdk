import Command from '../../service-command'

export default class ServiceGenDoc extends Command {
  static description = 'Generate the documentation for the service in a README.md file'

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
    const {args, flags} = this.parse(ServiceGenDoc)

    this.log('gen doc', args, flags)
  }
}
