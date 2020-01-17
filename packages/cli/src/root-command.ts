import {Command, flags} from '@oclif/command'
import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import Application from '@mesg/application'
import { RpcClient } from 'tendermint'
import API from '@mesg/api'
import {hash} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'
import {format, inspect} from 'util'
import {IService} from '@mesg/api/lib/service'
import {IInstance} from '@mesg/api/lib/instance'
import {IRunner} from '@mesg/api/lib/runner'

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q', description: 'Display only essential information'}),
    silent: flags.boolean({hidden: true}),
    port: flags.integer({char: 'p', default: 26657, description: 'Port to access the MESG engine'}),
    host: flags.string({default: 'localhost', description: 'Host to access the MESG engine'})
  }

  public api: {
    service: {
      list: (filter: any) => Promise<IService[]>,
      get: (hash: string) => Promise<IService>
    },
    instance: {
      list: (filter: any) => Promise<IInstance[]>
    },
    runner: {
      list: (filter: any) => Promise<IRunner[]>
    }
  }
  private readonly _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const {flags} = this.parse()
    const port = flags.port
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : flags.host
    const client = new RpcClient(`http://${host}:${port}`)
    const query = async (path: string) => {
      const res = await client.abciQuery({ path: `0x${Buffer.from(path).toString('hex')}` })
      return JSON.parse(Buffer.from(res.response.value, 'base64').toString())
    }
    this.api = {
      service: {
        list: () => query('/custom/service/list'),
        get: (hash) => query(`/custom/service/get/${hash}`)
      },
      instance: {
        list: () => query('/custom/instance/list')
      },
      runner: {
        list: () => query('/custom/runner/list')
      }
    }
    this._app = new Application()
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
}
