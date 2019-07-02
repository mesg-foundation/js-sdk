import Command from '../../root-command'
import { InstanceCreateOutputs } from 'mesg-js/lib/api';
import { flags } from '@oclif/command';

export default class InstanceCreate extends Command {
  static description = 'Create an instance of a service'

  static flags = {
    ...Command.flags,
    env: flags.string({
      description: 'set env defined in mesg.yml (configuration.env)',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true,
  }]

  async run(): InstanceCreateOutputs {
    const { args, flags } = this.parse(InstanceCreate)
    this.spinner.start('Create instance')
    const instance = await this.api.instance.create({
      serviceHash: args.SERVICE_HASH,
      env: flags.env
    })
    this.spinner.stop(instance.hash)
    return instance
  }
}
