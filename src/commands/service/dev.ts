import {Command, flags} from '@oclif/command'

export default class ServiceDev extends Command {
  static description = 'Run your service in development mode'

  static flags = {
    help: flags.help({char: 'h'}),
    env: flags.string({
      description: 'set env defined in mesg.yml (configuration.env)',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDev)

    this.log('dev', args, flags)
  }
}
