import Command from '../../root-command'
import { IAccount } from '@mesg/api/lib/account-lcd'

export default class AccountBalance extends Command {
  static description = 'Show an account balance'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ACCOUNT_ADDRESS',
    required: true
  }]

  async run(): Promise<IAccount> {
    const { args } = this.parse(AccountBalance)
    const res = await this.lcd.account.get(args.ACCOUNT_ADDRESS)
    this.styledJSON(res)
    return res
  }
}
