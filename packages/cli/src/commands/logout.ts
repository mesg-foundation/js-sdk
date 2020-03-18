import { Command, flags } from '@oclif/command'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import { join } from 'path'
import { parse } from 'url'

export default class Logout extends Command {
  static description = 'Logout from a registry'

  static flags = {
    registry: flags.string({ name: 'Registry to use', required: true, default: 'http://localhost:1317' })
  }

  async run() {
    const { flags } = this.parse(Logout)
    const vault = new Vault(new FileStore(join(this.config.configDir, 'credentials.json')))

    const key = parse(flags.registry).hostname
    if (!vault.contains(key)) return

    vault.remove(key)

    this.log('Successfully logged out')
  }
}
