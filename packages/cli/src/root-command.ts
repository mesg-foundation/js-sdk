import { Command, flags } from '@oclif/command'
import { IConfig } from '@oclif/config'
import Application from '@mesg/application'
import API from '@mesg/api'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import LCD from '@mesg/api/lib/lcd'
import { mkdirSync } from 'fs'
import { IAccount } from '@mesg/api/lib/account-lcd'
import { prompt } from 'inquirer'

export default abstract class extends Command {
  static flags = {
    port: flags.integer({ char: 'p', default: 50052, description: 'Port to access the MESG engine' }),
    "lcd-port": flags.integer({ default: 1317, description: 'Port to access the MESG engine LCD Api' }),
    host: flags.string({ default: 'localhost', description: 'Host to access the MESG engine' })
  }

  protected api: API
  protected lcd: LCD
  protected vault: Vault
  protected readonly _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const { flags } = this.parse()
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : flags.host
    this.api = new API(`${host}:${flags.port}`)
    this.lcd = new LCD(`http://${host}:${flags['lcd-port']}`)
    this._app = new Application(this.api)
    mkdirSync(this.config.configDir, { recursive: true })
    this.vault = new Vault(new FileStore(`${this.config.configDir}/addresses.json`))
  }

  flagsAsArgs({ port, host }: any): string[] {
    return ['--port', port.toString(), '--host', host.toString()]
  }

  async getAccount(address?: string): Promise<{ account: IAccount, mnemonic: string }> {
    if (!address) {
      const { account } = await prompt({
        type: 'list',
        name: 'account',
        message: 'Select an account to sign the transaction',
        choices: this.vault.keys()
      })
      address = account
    }
    const { password } = await prompt({
      name: 'password',
      type: 'password',
      message: 'Type the account\'s password',
    })

    const mnemonic = this.vault.get(address, password)
    return {
      account: await this.lcd.account.import(mnemonic),
      mnemonic,
    }
  }
}
