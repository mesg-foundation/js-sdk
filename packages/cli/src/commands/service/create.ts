import { prompt, } from 'inquirer'
import { flags } from '@oclif/command'

import Command from '../../root-command'

import ServiceStart from './start'
import { findHash } from '../../utils/txevent'
import { IService } from '@mesg/api/lib/service-lcd'

export default class ServiceCreate extends Command {
  static description = 'Create a service'

  static flags = {
    ...Command.flags,
    account: flags.string({
      description: 'Account to use to deploy the service'
    }),
    start: flags.boolean({
      description: 'Automatically start the service once created',
      default: false,
    })
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Service\'s definition. Use service:compile first to build service definition'
  }]

  async run(): Promise<IService> {
    const { args, flags } = this.parse(ServiceCreate)
    const service = JSON.parse(args.DEFINITION)

    const { account } = flags.account
      ? { account: flags.account }
      : await prompt({
        type: 'list',
        name: 'account',
        message: 'Select the account to create the service',
        choices: this.vault.keys()
      })

    const { password } = await prompt({
      name: 'password',
      type: 'password',
      message: 'Type the password to decrypt the account',
    })

    this.spinner.start('Creating service')
    const mnemonic = this.vault.get(account, password)
    const accountDetail = await this.lcd.account.import(mnemonic)
    const tx = await this.lcd.createTransaction(
      [this.lcd.service.createMsg(account, service)],
      accountDetail
    )

    const txResult = await this.lcd.broadcast(tx.signWithMnemonic(mnemonic))
    const hash = findHash(txResult, "service", "CreateService")
    this.spinner.stop(hash)

    if (flags.start) {
      this.spinner.start('Starting service')
      const start = await ServiceStart.run([hash, ...this.flagsAsArgs(flags)])
      this.spinner.stop(start.hash)
    }
    return this.lcd.service.get(hash)
  }
}
