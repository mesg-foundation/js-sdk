import {Command, flags} from '@oclif/command'

export default class ServiceDetail extends Command {
  static description = 'Show details of a deployed service'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDetail)

    this.log('detail', args, flags)
  }
}
