import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Start the Core'

  static flags = {
    help: flags.help({char: 'h'}),
    'log-force-colors': flags.boolean({
      description: 'log force colors',
      default: false
    }),
    'log-format': flags.enum({
      description: 'log format',
      default: 'text',
      options: ['text', 'json']
    }),
    'log-level': flags.enum({
      description: 'log level',
      default: 'info',
      options: ['debug', 'info', 'warn', 'error', 'fatal', 'panic']
    }),
  }

  async run() {
    const {args, flags} = this.parse(Start)
    this.log(args, flags)
  }
}
