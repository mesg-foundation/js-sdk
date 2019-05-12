import {WithPassphrase as Command} from '../../account-command'
import services from '../../services'

export default class AccountDelete extends Command {
  static description = 'Delete an existing account'

  static aliases = ['account:rm', 'account:destroy']

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountDelete)

    this.spinner.start('Delete account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.delete, {
      passphrase: await this.getPassphrase(),
      address: args.ADDRESS,
    })
    this.spinner.stop(data.address)
    return data
  }
}
