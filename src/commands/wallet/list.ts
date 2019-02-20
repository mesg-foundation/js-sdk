import {cli} from 'cli-ux'

import Command from '../../wallet-command'

export default class WalletList extends Command {
  static description = 'List all existing wallets'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(WalletList)
    const {output, data} = await this.execute(this.walletServiceID, this.tasks.list)
    if (output === 'error') {
      this.error(data.message)
      return null
    }
    cli.table(data.addresses, {
      address: {header: 'ADDRESS', get: (x: any) => x},
    }, {
      printLine: this.log,
      ...flags,
    })
    return data
  }
}
