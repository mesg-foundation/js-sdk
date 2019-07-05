import {flags} from '@oclif/command'
import {InstanceCreateOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class ServiceStart extends Command {
  static description = 'Start a service by creating a new instance'

  static flags = {
    ...Command.flags,
    env: flags.string({
      description: 'Set env defined in mesg.yml (configuration.env)',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true,
  }]

  async run(): InstanceCreateOutputs {
    const {args, flags} = this.parse(ServiceStart)
    this.spinner.start('Start instance')
    const instance = await this.api.instance.create({
      serviceHash: args.SERVICE_HASH,
      env: flags.env
    })
    this.spinner.stop(instance.hash)
    return instance
  }
}
