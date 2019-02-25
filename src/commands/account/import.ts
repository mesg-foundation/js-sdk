import {flags} from '@oclif/command'

import Command from '../../account-command'
import services from '../../services'

export default class AccountImport extends Command {
  static description = 'Import a account'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    }),
    account: flags.string({
      required: true,
      description: 'Account saved from a previous account'
    })
  }

  async run() {
    const {flags} = this.parse(AccountImport)

    this.spinner.start('Import account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.import, {
      passphrase: flags.passphrase,
      account: JSON.parse(flags.account),
    })
    this.spinner.stop(data.address)
    return data
  }
}
