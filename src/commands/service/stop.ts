import {Command, flags} from '@oclif/command'

export default class ServiceStop extends Command {
  static description = 'Stop a service'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceStop)

    this.log('stop', args, flags)
  }
}
