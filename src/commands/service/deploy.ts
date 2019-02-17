import {flags} from '@oclif/command'

import Command from '../../service-command'

export default class ServiceDeploy extends Command {
  static description = 'Deploy a service'

  static flags = {
    ...Command.flags,
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
    // TODO
    const {args, flags} = this.parse(ServiceDeploy)

    this.log('deploy', args, flags)
  }
}
