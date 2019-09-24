import {WithCredential as Command} from '../../../credential-command'

export default class AccountExpDelete extends Command {
  static description = 'Delete an account'
  static hidden = true

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ACCOUNT_NAME',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountExpDelete)
    const passphrase = await this.getCredentialPassphrase()
    this.spinner.start('Deleting account')
    const data = await this.api.account.delete({}, {
      username: args.ACCOUNT_NAME,
      passphrase: passphrase || '',
    })
    this.spinner.stop()
    return data
  }
}
