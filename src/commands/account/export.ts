import { WithPassphrase as Command } from '../../account-command'

export default class AccountExport extends Command {
  static description = 'Export an existing account'

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const { args } = this.parse(AccountExport)

    this.spinner.start('Export account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'export',
      inputs: JSON.stringify({
        passphrase: await this.getPassphrase(),
        address: args.ADDRESS,
      })
    })
    this.spinner.stop()
    this.styledJSON(data)
    return data
  }
}
