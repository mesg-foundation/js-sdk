import {Command, flags} from '@oclif/command'

export default class ServiceStart extends Command {
  static description = 'Start a service'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceStart)

    this.log('start', args, flags)

  }
}
