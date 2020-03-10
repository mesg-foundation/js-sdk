import cli from 'cli-ux'
import Command from '../../root-command'

export default class AccountList extends Command {
  static description = 'List all accounts'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<string[]> {
    const { flags } = this.parse(AccountList)
    const accounts = this.vault.keys().map(address => ({ address }))
    cli.table(accounts, {
      address: { header: 'ADDRESS' },
    }, { printLine: this.log, ...flags })
    return accounts
  }
}