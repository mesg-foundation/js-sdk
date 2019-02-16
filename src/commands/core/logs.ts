import {Command, flags} from '@oclif/command'

export default class Logs extends Command {
  static description = 'Show the Core\'s logs'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.log('Core log')
  }
}
