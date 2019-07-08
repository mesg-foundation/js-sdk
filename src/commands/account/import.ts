import {WithPassphrase as Command} from '../../account-command'

export default class AccountImport extends Command {
  static description = 'Import an account'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'ACCOUNT',
    description: 'Account definition in JSON (could be retrieved with account:export)',
    required: true
  }]

  async run() {
    const {args} = this.parse(AccountImport)
    const passphrase = await this.getPassphrase()
    this.spinner.start('Importing account')
    const data = await this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'import',
      inputs: JSON.stringify({
        account: JSON.parse(args.ACCOUNT),
        passphrase,
      })
    })
    this.spinner.stop()
    this.log(`Account ${data.address} imported`)
    return data
  }
}
