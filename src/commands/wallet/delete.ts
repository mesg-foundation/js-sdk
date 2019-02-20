import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletDelete extends Command {
  static description = 'Delete an existing wallet'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    })
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args, flags} = this.parse(WalletDelete)

    cli.action.start('Delete wallet')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.delete, {
      passphrase: flags.passphrase,
      address: args.ADDRESS,
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop(data.address)
    return data
  }
}
