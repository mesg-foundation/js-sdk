import {Command, flags} from '@oclif/command'

export default class ServiceDelete extends Command {
  static description = 'Delete one or many services'

  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({description: 'Delete all services'}),
    'keep-data': flags.boolean({description: 'Do not delete services\' persistent data'}),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDelete)

    this.log('delete', args, flags)
  }
}
