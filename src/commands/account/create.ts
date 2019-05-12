import {WithPassphrase as Command} from '../../account-command'
import services from '../../services'

export default class AccountCreate extends Command {
  static description = 'Create a new account'

  static flags = {
    ...Command.flags
  }

  async run() {
    this.spinner.start('Create account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.create, {
      passphrase: await this.getPassphrase(),
    })
    this.spinner.stop(data.address)
    return data
  }
}
