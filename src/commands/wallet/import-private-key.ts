import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletImportPK extends Command {
  static description = 'Import a wallet from a private key'

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
    const {args, flags} = this.parse(WalletImportPK)

    cli.action.start('Import wallet')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.importPK, {
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
