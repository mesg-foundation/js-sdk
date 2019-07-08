import {WithPassphrase as Command} from '../../account-command'

export default class AccountExport extends Command {
  static description = 'Export an existing account'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountExport)
    const passphrase = await this.getPassphrase()
    this.spinner.start('Exporting account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'export',
      inputs: JSON.stringify({
        address: args.ADDRESS,
        passphrase,
      })
    })
    this.spinner.stop()
    this.styledJSON(data)
    return data
  }
}
