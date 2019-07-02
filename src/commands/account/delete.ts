import {WithPassphrase as Command} from '../../account-command'

export default class AccountDelete extends Command {
  static description = 'Delete an existing account'

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountDelete)

    this.spinner.start('Delete account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'delete',
      inputs: JSON.stringify({
        passphrase: await this.getPassphrase(),
        address: args.ADDRESS,
      })
    })
    this.spinner.stop(data.address)
    return data
  }
}
