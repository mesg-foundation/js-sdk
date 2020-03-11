import { prompt } from 'inquirer'
import Command from '../../root-command'
import { IAccount } from '@mesg/api/lib/account-lcd'

export default class AccountCreate extends Command {
  static description = 'Create an account'

  static flags = {
    ...Command.flags
  }

  async run(): Promise<IAccount> {
    const { mnemonic, password } = await prompt([
      {
        name: 'mnemonic',
        message: 'Type your mnemonic',
      },
      {
        name: 'password',
        type: 'password',
        message: 'Type the password to encrypt your account',
      }
    ])
    const account = await this.lcd.account.import(mnemonic)
    this.vault.set(account.address, mnemonic, password)
    this.styledJSON({
      ...account,
      mnemonic
    })
    return account
  }
}
