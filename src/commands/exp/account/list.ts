import {cli} from 'cli-ux'

import {WithoutPassphrase as Command} from '../../../account-command'

export default class AccountExpList extends Command {
  static description = 'List accounts'
  static hidden = true

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(AccountExpList)

    const {accounts} = await this.api.account.list({})
    cli.table(accounts, {
      name: {header: 'NAME', get: x => x.name},
      address: {header: 'ADDRESS', get: x => x.address},
    }, {printLine: this.log, ...flags})
    return accounts
  }
}
