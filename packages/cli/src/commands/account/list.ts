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
    const accounts = this.vault.keys()
    const data = await Promise.all(accounts.map(x => this.lcd.account.get(x)))
    cli.table(data, {
      address: { header: 'ADDRESS' },
      coins: { header: 'COINS', get: account => account.coins.map(x => `${x.amount}${x.denom}`).join(', ') },
      sequence: { header: 'SEQUENCE', extended: true },
      account_number: { header: 'ACC NUMBER', extended: true },
      public_key: { header: 'PUB KEY', extended: true },
    }, { printLine: this.log, ...flags })
    return accounts
  }
}
