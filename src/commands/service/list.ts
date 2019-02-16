import {Command, flags} from '@oclif/command'

export default class ServiceList extends Command {
  static description = 'List all deployed services'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(ServiceList)

    this.log('list', args, flags)

  }
}
