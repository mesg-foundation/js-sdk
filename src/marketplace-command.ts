import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {prompt} from 'inquirer'

import Command from './root-command'
import services from './services'

export interface Manifest {
  version: 1
  service: {
    definition: any
    readme: string
    hash: string
    hashVersion: '1'
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
      description: 'Passphrase to unlock your account'
    })
  }

  async sign(account: string, data: any, passphrase: string) {
    const res = await this.executeAndCaptureError(services.account.id, services.account.tasks.sign, {
      passphrase,
      address: account,
      transaction: data,
    })
    return res.data
  }

  async getAccount(): Promise<string> {
    const {flags} = this.parse()
    if (flags.account) {
      return flags.account
    }
    const list = await this.executeAndCaptureError(services.account.id, services.account.tasks.list)
    this.require(list.data.addresses.length > 0, 'You need to create an account first.')
    if (list.data.addresses.length === 1) {
      return list.data.addresses[0]
    }
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
    if (flags.passphrase) {
      return flags.passphrase
    }
    return cli.prompt('Type your passphrase', {type: 'hide'})
  }
}
