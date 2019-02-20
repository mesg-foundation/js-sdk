import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletImport extends Command {
  static description = 'Import a wallet'

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
    const {flags} = this.parse(WalletImport)

    cli.action.start('Import wallet')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.import, {
      passphrase: flags.passphrase,
      account: JSON.parse(flags.account),
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop(data.address)
    return data
  }
}
