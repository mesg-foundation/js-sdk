import {WithPassphrase as Command} from '../../account-command'

export default class AccountDelete extends Command {
  static description = 'Delete an account'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ADDRESS',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountDelete)
    const passphrase = await this.getPassphrase()
    this.spinner.start('Deleting account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'delete',
      inputs: {
        address: args.ADDRESS,
        passphrase
      }
    })
    this.spinner.stop()
    return data
  }
}
