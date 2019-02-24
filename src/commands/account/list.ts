import {cli} from 'cli-ux'

import Command from '../../account-command'
import services from '../../services'

export default class AccountList extends Command {
  static description = 'List all existing accounts'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(AccountList)
    const {output, data} = await this.execute(services.account.id, services.account.tasks.list)
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
