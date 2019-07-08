import {WithPassphrase as Command} from '../../account-command'

export default class AccountCreate extends Command {
  static description = 'Create an account'

  static flags = {
    ...Command.flags,
  }

  async run() {
    const passphrase = await this.getPassphrase()
    this.spinner.start('Creating account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'create',
      inputs: JSON.stringify({passphrase})
    })
    this.spinner.stop()
    this.log(`Account address ${data.address}`)
    return data
  }
}
