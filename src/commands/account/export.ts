import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../account-command'
import services from '../../services'

export default class AccountExport extends Command {
  static description = 'Export an existing account'

  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    })
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args, flags} = this.parse(AccountExport)

    this.spinner.start('Export account')
    const {data} = await this.executeAndCaptureError(services.account.id, services.account.tasks.export, {
      passphrase: flags.passphrase,
      address: args.ADDRESS,
    })
    this.spinner.stop()
    cli.styledJSON(data)
    return data
  }
}
