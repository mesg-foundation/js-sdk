import {flags} from '@oclif/command'

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

    this.spinner.start('Create account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.create, {
      passphrase: flags.passphrase,
    })
    this.spinner.stop(data.address)
    return data
  }
}
