import {Command, flags} from '@oclif/command'
import {IConfig} from '@oclif/config'
import {cli} from 'cli-ux'
import {application} from 'mesg-js'
import createApi, {API, ExecutionCreateInputs, InfoOutputs} from 'mesg-js/lib/api'
import {Application} from 'mesg-js/lib/application'
import {format, inspect} from 'util'

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q', description: 'Display only result. No loader.'}),
    silent: flags.boolean({hidden: true}),
  }

  public api: API
  private readonly _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const port = 50052
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : 'localhost'
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
    cli.styledJSON(data)
  }

  async execute(request: ExecutionCreateInputs): Promise<any> {
    const exec = await this._app.executeTaskAndWaitResult(request)
    return JSON.parse(exec.outputs || '')
  }

  async info(): InfoOutputs {
    return this.api.core.info()
  }

  async engineServiceInstance(key: string) {
    const info = await this.info()
    const service = info.services.find((x: any) => x.key === key)
    if (!service) {
      throw new Error(`Cannot find service ${key}`)
    }
    return service.hash
  }
}
