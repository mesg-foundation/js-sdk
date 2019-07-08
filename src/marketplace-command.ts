import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {prompt} from 'inquirer'

import {WithoutPassphrase} from './account-command'
import Command from './root-command'

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
      description: 'Passphrase to unlock the account'
    })
  }

  static SERVICE_NAME = 'Marketplace'

  async sign(account: string, data: any, passphrase: string) {
    return this.execute({
      instanceHash: await this.engineServiceInstance(WithoutPassphrase.SERVICE_NAME),
      taskKey: 'sign',
      inputs: JSON.stringify({
        passphrase,
        address: account,
        transaction: data,
      })
    })
  }

  async getAccount(): Promise<string> {
    const {flags} = this.parse()
    if (flags.account) {
      return flags.account
    }
    const {addresses} = await this.execute({
      instanceHash: await this.engineServiceInstance(WithoutPassphrase.SERVICE_NAME),
      taskKey: 'list',
      inputs: JSON.stringify({})
    })
    if (!addresses.length) {
      throw new Error('You need to create an account first.')
    }
    if (addresses.length === 1) {
      return addresses[0]
    }
    const {account} = (await prompt({
      type: 'list',
      name: 'account',
      message: 'Select the account to use:',
      choices: addresses
    })) as { account: string }
    return account
  }

  async getPassphrase(): Promise<string> {
    const {flags} = this.parse()
    if (flags.passphrase) {
      return flags.passphrase
    }
    return cli.prompt('Type the passphrase', {type: 'hide'})
  }
}
