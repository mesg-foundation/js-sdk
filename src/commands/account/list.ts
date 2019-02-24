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
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.list)
    cli.table(data.addresses, {
      address: {header: 'ADDRESS', get: (x: any) => x},
    }, {
      printLine: this.log,
      ...flags,
    })
    return data
  }
}
