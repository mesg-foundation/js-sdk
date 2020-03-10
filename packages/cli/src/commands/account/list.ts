import Command from '../../root-command'

export default class AccountList extends Command {
  static description = 'List all accounts'

  static flags = {
    ...Command.flags,
  }

  async run(): Promise<string[]> {
    const accounts = this.vault.keys()
    this.styledJSON(accounts)
    return accounts
  }
}
