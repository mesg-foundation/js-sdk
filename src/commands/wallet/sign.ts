import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletSign extends Command {
  static description = 'Sign a transaction'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    }),
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }, {
    name: 'TRANSACTION',
    required: true
  }]

  async run() {
    const {args, flags} = this.parse(WalletSign)

    cli.action.start('Sign transaction')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.sign, {
      passphrase: flags.passphrase,
      address: args.ADDRESS,
      transaction: JSON.parse(args.TRANSACTION),
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop(data.signedTransaction)
    return data
  }
}
