import {WithPassphrase as Command} from '../../account-command'
import services from '../../services'

export default class AccountExport extends Command {
  static description = 'Export an existing account'

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountExport)

    this.spinner.start('Export account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.export, {
      passphrase: await this.getPassphrase(),
      address: args.ADDRESS,
    })
    if (!data) {
      this.error('account not found or passphrase does not match')
    }
    this.spinner.stop()
    this.styledJSON(data)
    return data
  }
}
