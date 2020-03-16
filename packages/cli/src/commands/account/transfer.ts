import Command from '../../root-command'
import { flags } from '@oclif/command'
import { IAccount } from '@mesg/api/lib/account-lcd'
import { ICoin } from '@mesg/api/lib/transaction'

export default class AccountTransfer extends Command {
  static description = 'Transfer token to another address'

  static flags = {
    ...Command.flags,
    account: flags.string({
      description: 'Account to use to take the tokens from'
    }),
  }

  static args = [{
    name: 'TO',
    required: true
  }, {
    name: 'AMOUNT',
    required: true
  }]

  async run(): Promise<IAccount> {
    const { args, flags } = this.parse(AccountTransfer)
    const { account, mnemonic } = await this.getAccount(flags.account)

    this.spinner.start(`Transfering ${args.AMOUNT}atto to ${args.TO}`)
    const coins: ICoin[] = [{
      amount: args.AMOUNT,
      denom: 'atto'
    }]
    const tx = await this.lcd.createTransaction(
      [this.lcd.account.transferMsg(account.address, args.TO, coins)],
      account
    )
    const txResult = await this.lcd.broadcast(tx.signWithMnemonic(mnemonic))
    const res = await this.lcd.account.get(account.address)
    this.styledJSON(res)
    return res
  }
}
