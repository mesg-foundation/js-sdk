import {Command, flags} from '@oclif/command'

export default class Stop extends Command {
  static description = 'Stop the Core'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.log('stop')
  }
}
