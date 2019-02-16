import {Command, flags} from '@oclif/command'

export default class ServiceLog extends Command {
  static description = 'Show logs of a service'

  static flags = {
    help: flags.help({char: 'h'}),
    dependency: flags.string({
      char: 'd',
      description: 'Name of the dependency to show the logs from',
      multiple: true
    }),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceLog)

    this.log('log', args, flags)

  }
}
