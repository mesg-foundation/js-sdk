import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletExport extends Command {
  static description = 'Export an existing account'

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
    const {args, flags} = this.parse(WalletExport)

    cli.action.start('Export account')
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.export, {
      passphrase: flags.passphrase,
      address: args.ADDRESS,
    })
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.action.stop()
    cli.styledJSON(data)
    return data
  }
}
