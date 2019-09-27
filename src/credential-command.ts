import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {Credential} from 'mesg-js/lib/api'

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
    return cli.prompt('Type the name of the account')
  }
}
