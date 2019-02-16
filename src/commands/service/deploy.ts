import {Command, flags} from '@oclif/command'

export default class ServiceDeploy extends Command {
  static description = 'Deploy a service'

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
    const {args, flags} = this.parse(ServiceDeploy)

    this.log('deploy', args, flags)
  }
}
