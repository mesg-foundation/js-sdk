import { Command, flags } from '@oclif/command'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import { join } from 'path'
import { prompt } from 'inquirer'
import API from '@mesg/api/lib/lcd'
import { parse } from 'url'

export default class Login extends Command {
  static description = 'Login to a registry'

  static flags = {
    mnemonic: flags.string({ description: "Mnemonic used for your account" }),
    password: flags.string({ description: "Password of your account" }),
    registry: flags.string({ name: 'Registry to use', required: true, default: 'http://localhost:1317' })
  }

  async run() {
    const { flags } = this.parse(Login)
    const lcd = new API(flags.registry)
    const vault = new Vault(new FileStore(join(this.config.configDir, 'credentials.json')))

    const key = parse(flags.registry).hostname
    if (vault.contains(key)) this.error('Already logged in')

    const mnemonic = flags.mnemonic
      ? flags.mnemonic
      : ((await prompt([{ name: 'mnemonic', message: 'Type your mnemonic' }])) as any).mnemonic
    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Type the password to encrypt your account' }])) as any).password

    const { address, public_key } = await lcd.account.import(mnemonic)
    vault.set(key, { address, public_key, mnemonic }, password)

    this.log(`Successfully logged in with the address: ${address}`)
  }
}
