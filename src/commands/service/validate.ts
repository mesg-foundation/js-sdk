import {Command, flags} from '@oclif/command'

export default class ServiceValidate extends Command {
  static description = 'Validate a service file. Check the yml format and rules.'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceValidate)

    this.log('validate', args, flags)
  }
}
