import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from './root-command'

export abstract class WithoutPassphrase extends Command {
  static flags = {
    ...Command.flags
  }
}

export abstract class WithPassphrase extends WithoutPassphrase {
  static flags = {
    ...WithoutPassphrase.flags,
    passphrase: flags.string({
      required: true,
      description: 'Passphrase to unlock your address'
    })
  }

  async getPassphrase(): Promise<string | null> {
    const {flags} = this.parse()
    if (flags.passphrase) { return flags.passphrase }
    const passphrase = await cli.prompt('Type your passphrase', {type: 'mask'})
    return passphrase
  }
}
