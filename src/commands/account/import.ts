import {WithPassphrase as Command} from '../../account-command'
import services from '../../services'

export default class AccountImport extends Command {
  static description = 'Import a account'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ACCOUNT',
    description: 'Account saved from a previous account',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountImport)

    this.spinner.start('Import account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.import, {
      passphrase: await this.getPassphrase(),
      account: JSON.parse(args.ACCOUNT),
    })
    this.spinner.stop(data.address)
    return data
  }
}
