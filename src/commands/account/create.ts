import { WithPassphrase as Command } from '../../account-command'

export default class AccountCreate extends Command {
  static description = 'Create a new account'

  async run() {
    this.spinner.start('Create account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'create',
      inputs: JSON.stringify({
        passphrase: await this.getPassphrase(),
      })
    })
    this.spinner.stop(data.address)
    return data
  }
}
