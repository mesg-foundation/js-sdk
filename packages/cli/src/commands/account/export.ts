import { prompt } from 'inquirer'
import Command from '../../root-command'

export default class AccountExport extends Command {
  static description = 'Export account and display the mnemonic'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'ACCOUNT_ADDRESS',
    required: true
  }]

  async run(): Promise<string> {
    const { args } = this.parse(AccountExport)
    const { password } = await prompt({
      name: 'password',
      type: 'password',
      message: 'Type the password to decrypt your account',
    })
    const mnemonic = this.vault.get(args.ACCOUNT_ADDRESS, password)
    this.log(mnemonic)
    return mnemonic
  }
}
