import {flags} from '@oclif/command'

import Command from '../../account-command'
import services from '../../services'

export default class AccountImportPK extends Command {
  static description = 'Import a account from a private key'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    }),
  }

  static args = [{
    name: 'PRIVATE_KEY',
    description: 'Private key for your account',
    required: true,
  }]

  async run() {
    const {args, flags} = this.parse(AccountImportPK)

    this.spinner.start('Import account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.importPK, {
      passphrase: flags.passphrase,
      privateKey: args.PRIVATE_KEY,
    })
    this.spinner.stop(data.address)
    return data
  }
}
