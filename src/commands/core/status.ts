import {Command, flags} from '@oclif/command'

export default class Status extends Command {
  static description = 'Get the Core\'s status'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.log('core status')
  }
}
