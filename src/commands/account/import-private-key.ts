import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

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

    cli.action.start('Import account')
    const {output, data} = await this.execute(services.account.id, services.account.tasks.importPK, {
      passphrase: flags.passphrase,
      privateKey: args.PRIVATE_KEY,
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop(data.address)
    return data
  }
}
