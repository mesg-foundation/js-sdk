import {WithPassphrase as Command} from '../../account-command'

export default class AccountImportPK extends Command {
  static description = 'Import an account with a private key'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'PRIVATE_KEY',
    description: 'Private key of the account',
    required: true,
  }]

  async run() {
    const {args} = this.parse(AccountImportPK)
    const passphrase = await this.getPassphrase()
    this.spinner.start('Importing account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'importFromPrivateKey',
      inputs: JSON.stringify({
        privateKey: args.PRIVATE_KEY,
        passphrase,
      })
    })
    this.spinner.stop()
    this.log(`Account ${data.address} imported with success`)
    return data
  }
}
