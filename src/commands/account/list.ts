import { cli } from 'cli-ux'

import { WithoutPassphrase as Command } from '../../account-command'

export default class AccountList extends Command {
  static description = 'List all existing accounts'

  static aliases = ['account:ls']

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const { flags } = this.parse(AccountList)
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'list',
      inputs: JSON.stringify({})
    })
    cli.table(data.addresses, {
      address: { header: 'ADDRESS', get: (x: any) => x },
    }, { printLine: this.log, ...flags })
    return data
  }
}
