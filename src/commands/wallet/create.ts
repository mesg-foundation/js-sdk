import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletCreate extends Command {
  static description = 'Create a new wallet'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    })
  }

  async run() {
    const {flags} = this.parse(WalletCreate)

    cli.action.start('Create wallet')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.create, {
      passphrase: flags.passphrase,
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop(data.address)
    return data
  }
}
