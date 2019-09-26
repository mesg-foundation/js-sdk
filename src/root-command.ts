import {Command, flags} from '@oclif/command'
import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import {application} from 'mesg-js'
import createApi, {API} from 'mesg-js/lib/api'
import {hash} from 'mesg-js/lib/api/types'
import {Application} from 'mesg-js/lib/application'
import * as base58 from 'mesg-js/lib/util/base58'
import {format, inspect} from 'util'

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q', description: 'Display only essential information'}),
    silent: flags.boolean({hidden: true}),
    port: flags.integer({char: 'p', default: 50052, description: 'Port to access the MESG engine'}),
    host: flags.string({default: 'localhost', description: 'Host to access the MESG engine'})
  }

  public api: API
  private readonly _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const {flags} = this.parse()
    const port = flags.port
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : flags.host
    const endpoint = `${host}:${port}`
    this.api = createApi(endpoint)
    this._app = application({endpoint})
  }

  get spinner() {
    const {flags} = this.parse()
    const nope = () => { }
    if (flags.quiet) {
      return {start: nope, stop: (message?: string) => message ? this.log(message) : null, status: null}
    }
    if (flags.silent) {
      return {start: nope, stop: nope, status: null}
    }
    return cli.action
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

  async execute(request: {instanceHash: hash, taskKey: string, inputs?: {[key: string]: any}, tags?: string[]}): Promise<{[key: string]: any}> {
    const exec = await this._app.executeTaskAndWaitResult({
      instanceHash: request.instanceHash,
      tags: request.tags || [],
      taskKey: request.taskKey,
      inputs: this._app.encodeData(request.inputs || {})
    })
    if (exec.error) throw new Error(exec.error)
    if (!exec.outputs) throw new Error('missing outputs')
    return this._app.decodeData(exec.outputs)
  }
}
