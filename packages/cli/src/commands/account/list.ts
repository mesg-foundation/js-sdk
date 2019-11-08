import {cli} from 'cli-ux'

import Command from '../../root-command'

export default class AccountList extends Command {
  static description = 'List accounts'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(AccountList)

    const {accounts} = await this.api.account.list({})
    cli.table(accounts || [], {
      name: {header: 'NAME', get: x => x.name},
      address: {header: 'ADDRESS', get: x => x.address},
    }, {printLine: this.log, ...flags})
    return accounts || []
  }
}
