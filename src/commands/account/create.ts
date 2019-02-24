import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../account-command'
import services from '../../services'

export default class AccountCreate extends Command {
  static description = 'Create a new account'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your account'
    })
  }

  async run() {
    const {flags} = this.parse(AccountCreate)

    cli.action.start('Create account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.create, {
      passphrase: flags.passphrase,
    })
    cli.action.stop(data.address)
    return data
  }
}
