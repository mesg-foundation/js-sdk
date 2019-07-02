import { WithPassphrase as Command } from '../../account-command'

export default class AccountImport extends Command {
  static description = 'Import a account'

  static args = [{
    name: 'ACCOUNT',
    description: 'Account saved from a previous account',
    required: true
  }]

  async run() {
    const { args } = this.parse(AccountImport)

    this.spinner.start('Import account')
    const data = await this.execute({
      instanceHash: await this.walletInstance(),
      taskKey: 'import',
      inputs: JSON.stringify({
        passphrase: await this.getPassphrase(),
        account: JSON.parse(args.ACCOUNT),
      })
    })
    this.spinner.stop(data.address)
    return data
  }
}
