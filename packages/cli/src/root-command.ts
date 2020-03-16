import {Command, flags} from '@oclif/command'
import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import Application from '@mesg/application'
import API from '@mesg/api'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import LCD from '@mesg/api/lib/lcd'
import {hash} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'
import {format, inspect} from 'util'
import { mkdirSync } from 'fs'
import { IAccount } from '@mesg/api/lib/account-lcd'
import { prompt } from 'inquirer'

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q', description: 'Display only essential information'}),
    silent: flags.boolean({hidden: true}),
    port: flags.integer({char: 'p', default: 50052, description: 'Port to access the MESG engine'}),
    "lcd-port": flags.integer({default: 1317, description: 'Port to access the MESG engine LCD Api'}),
    host: flags.string({default: 'localhost', description: 'Host to access the MESG engine'})
  }

  protected api: API
  protected lcd: LCD
  protected vault: Vault 
  private readonly _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const {flags} = this.parse()
    const port = flags.port
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : flags.host
    this.api = new API(`${host}:${flags.port}`)
    this.lcd = new LCD(`http://${host}:${flags['lcd-port']}`)
    this._app = new Application(this.api)
    mkdirSync(this.config.configDir, { recursive: true })
    this.vault = new Vault(new FileStore(`${this.config.configDir}/addresses.json`))
  }

  get spinner() {
    const {flags} = this.parse()
    const nope = () => { }
    if (flags.quiet) {
      return {start: nope, stop: (message?: string) => message ? this.log(message) : null, status: null as any}
    }
    if (flags.silent) {
      return {start: nope, stop: nope, status: null}
    }
    return cli.action
  }

  flagsAsArgs({port, host}: any): string[] {
    return ['--port', port.toString(), '--host', host.toString()]
  }

  log(message?: string, ...args: any[]): void {
    if (this.parse) {
      const {flags} = this.parse()
      if (flags.silent) {
        return
      }
    }
    message = typeof message === 'string' ? message : inspect(message)
    process.stdout.write(format(message, ...args) + '\n')
  }

  styledJSON(data: any) {
    const {flags} = this.parse()
    if (flags.silent) return
    const base58EncodedHash = JSON.parse(JSON.stringify(data, (key: string, value: any): any => {
      return key && RegExp('hash$', 'i').test(key) && value && value.type === 'Buffer'
        ? base58.encode(value.data)
        : value
    }))
    cli.styledJSON(base58EncodedHash)
  }

  async catch(err: Error) {
    try {
      await super.catch(err)
    } catch (e) {
      if (e.message) {
        this.error(err.message)
      } else {
        throw e
      }
    }
  }

  async execute(request: {executorHash: hash, taskKey: string, eventHash: hash, inputs?: {[key: string]: any}, tags?: string[]}): Promise<{[key: string]: any}> {
    const exec = await this._app.executeTaskAndWaitResult({
      executorHash: request.executorHash,
      tags: request.tags || [],
      taskKey: request.taskKey,
      inputs: this._app.encodeData(request.inputs || {}),
      eventHash: request.eventHash,
    })
    if (exec.error) throw new Error(exec.error)
    if (!exec.outputs) throw new Error('missing outputs')
    return this._app.decodeData(exec.outputs)
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
