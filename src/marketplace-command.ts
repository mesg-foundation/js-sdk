import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {prompt} from 'inquirer'

import Command from './root-command'
import services from './services'

export interface Manifest {
  version: 1
  definition: any
  readme: string
  service: {
    deployment: {
      type: 'ipfs'
      source: string
    }
  }
}

export default abstract class MarketplaceCommand extends Command {
  static flags = {
    ...Command.flags,
    account: flags.string({
      char: 'a',
      description: 'Account to use'
    }),
    passphrase: flags.string({
      char: 'p',
      required: true,
      description: 'Passphrase to unlock your account'
    })
  }

  async signAndBroadcast(account: string, data: any, passphrase: string) {
    const res = await this.executeAndCaptureError(services.account.id, services.account.tasks.sign, {
      passphrase,
      address: account,
      transaction: data,
    })
    return this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.sendSignedTransaction, res.data)
  }

  async getAccount(): Promise<string> {
    const {flags} = this.parse()
    if (flags.account) { return flags.account }
    const list = await this.executeAndCaptureError(services.account.id, services.account.tasks.list)
    if (list.data.addresses.length === 0) { throw new Error('You need to create an account first.') }
    if (list.data.addresses.length === 1) { return list.data.addresses[0] }
    const {account} = (await prompt({
      type: 'list',
      name: 'account',
      message: 'Choose the account to use to publish your service',
      choices: list.data.addresses
    })) as {account: string}
    return account
  }

  async getPassphrase(): Promise<string> {
    const {flags} = this.parse()
    if (flags.passphrase) { return flags.passphrase }
    return cli.prompt('Type your passphrase', {type: 'hide'})
  }
}
