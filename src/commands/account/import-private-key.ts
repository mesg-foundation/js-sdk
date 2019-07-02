import { WithPassphrase as Command } from '../../account-command'

export default class AccountImportPK extends Command {
  static description = 'Import a account from a private key'

  static args = [{
    name: 'PRIVATE_KEY',
    description: 'Private key for your account',
    required: true,
  }]

  async run() {
    const { args } = this.parse(AccountImportPK)

    this.spinner.start('Import account')
    const data = await this.execute({
      instanceHash: await this.walletInstance(),
      taskKey: 'importFromPrivateKey',
      inputs: JSON.stringify({
        passphrase: await this.getPassphrase(),
        privateKey: args.PRIVATE_KEY,
      })
    })
    this.spinner.stop(data.address)
    return data
  }
}
