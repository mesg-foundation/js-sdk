import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { application } from 'mesg-js'
import createApi, { API, ExecutionCreateInputs, ExecutionGetOutputs } from 'mesg-js/lib/api'
import { format, inspect } from 'util'
import { IConfig } from '@oclif/config';
import { Application } from 'mesg-js/lib/application';

export default abstract class extends Command {
  static flags = {
    help: flags.help({ char: 'h' }),
    quiet: flags.boolean({ char: 'q' }),
    silent: flags.boolean(),
  }

  public api: API
  private _app: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    const port = 50052
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : 'localhost'
    const endpoint = `${host}:${port}`
    this.api = createApi(endpoint)
    this._app = application({ endpoint })
  }

  get spinner() {
    const { flags } = this.parse()
    const nope = () => { }
    if (flags.quiet) {
      return { start: nope, stop: (message?: string) => message ? this.log(message) : null, status: null }
    }
    if (flags.silent) {
      return { start: nope, stop: nope, status: null }
    }
    return cli.action
  }

  require(condition: any, errorMessage: string) {
    if (!condition) {
      throw new Error(errorMessage)
    }
  }

  log(message?: string, ...args: any[]): void {
    if (this.parse) {
      const { flags } = this.parse()
      if (flags.silent) {
        return
      }
    }
    message = typeof message === 'string' ? message : inspect(message)
    process.stdout.write(format(message, ...args) + '\n')
  }

  styledJSON(data: any) {
    const { flags } = this.parse()
    if (flags.silent) return
    cli.styledJSON(data)
  }

  async execute(request: ExecutionCreateInputs): Promise<any> {
    const exec = await this._app.executeTaskAndWaitResult(request)
    return JSON.parse(exec.outputs || '')
  }
}
