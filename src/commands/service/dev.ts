import {flags} from '@oclif/command'

import Command from '../../service-command'

export default class ServiceDev extends Command {
  static description = 'Run your service in development mode'

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
    const {args, flags} = this.parse(ServiceDev)

    this.log('dev', args, flags)
  }
}
