import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {createPromptModule} from 'inquirer'
import {Account, Credential} from 'mesg-js/lib/api'

import Command from './root-command'

export abstract class WithCredentialPassphrase extends Command {
  static flags = {
    ...Command.flags,
    passphrase: flags.string({
      description: 'Passphrase of the account'
    })
  }

  async getCredentialPassphrase(): Promise<string> {
    const {flags} = this.parse()
    if (flags.passphrase) return flags.passphrase
    return cli.prompt('Type the passphrase', {type: 'hide'})
  }
}

export abstract class WithCredential extends WithCredentialPassphrase {
  static flags = {
    ...WithCredentialPassphrase.flags,
    account: flags.string({
      description: 'Name of the account'
    })
  }

  async getCredential(): Promise<Credential> {
    return {
      username: await this.getCredentialUsername(),
      passphrase: await this.getCredentialPassphrase(),
    }
  }

  async getCredentialUsername(): Promise<string> {
    const {flags} = this.parse()
    if (flags.account) return flags.account
    const {accounts} = await this.api.account.list({})
    if (!accounts) throw new Error('no account found, please run `mesg-cli account:create ACCOUNT_NAME`')
    const prompt = createPromptModule({output: process.stderr})
    const {value} = (await prompt({
      type: 'list',
      name: 'value',
      message: 'Select the account to use',
      default: 'Basic',
      choices: accounts.map((x: Account) => ({
        name: `${x.name} ➜ ${x.address}`,
        value: x.name,
        short: x.name
      }))
    })) as { value: string }
    return value
  }
}
