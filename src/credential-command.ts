import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {Credential} from 'mesg-js/lib/api'

import Command from './root-command'

export abstract class WithCredential extends Command {
  static flags = {
    ...Command.flags,
    account: flags.string({
      description: 'Name of the account'
    }),
    passphrase: flags.string({
      description: 'Passphrase of the account'
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
    return cli.prompt('Type the name of the account', {type: 'hide'})
  }

  async getCredentialPassphrase(): Promise<string> {
    const {flags} = this.parse()
    if (flags.passphrase) return flags.passphrase
    return cli.prompt('Type the passphrase', {type: 'hide'})
  }
}
