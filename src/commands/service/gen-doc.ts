import {Command, flags} from '@oclif/command'

export default class ServiceGenDoc extends Command {
  static description = 'Generate the documentation for the service in a README.md file'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceGenDoc)

    this.log('gen doc', args, flags)
  }
}
