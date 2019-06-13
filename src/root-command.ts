import * as protoLoader from '@grpc/proto-loader'
import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as grpc from 'grpc'
import {application} from 'mesg-js'
import {Application, EventData, Stream} from 'mesg-js/lib/application'
import {checkStreamReady, errNoStatus} from 'mesg-js/lib/util/grpc'
import {join} from 'path'
import {format, inspect} from 'util'

type UNARY_METHODS = 'DeleteService'
  | 'GetService'
  | 'ListServices'
  | 'StartService'
  | 'StopService'
  | 'Info'

export interface ExecutionResult {
  data: any
}

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q'}),
    silent: flags.boolean(),
  }

  private _mesg: Application | null = null
  private _serviceAPI: any

  get engineEndpoint(): string {
    const host = process.env.DOCKER_HOST
      ? new URL(process.env.DOCKER_HOST).hostname
      : 'localhost'
    return `${host}:50052`
  }

  get mesg() {
    if (!this._mesg) {
      this._mesg = application({endpoint: this.engineEndpoint})
    }
    return this._mesg
  }

  get serviceAPI() {
    if (!this._serviceAPI) {
      this._serviceAPI = this.createClient('ServiceX', 'api', 'service.proto', this.engineEndpoint)
    }
    return this._serviceAPI
  }

  createClient(serviceName: string, dir: string, file: string, endpoint: string) {
    const packageDefinition = protoLoader.loadSync(join(__dirname, './protobuf', dir, file), {
      includeDirs: [__dirname]
    })
    const packageObject = grpc.loadPackageDefinition(packageDefinition) as any
    const clientConstructor = packageObject[dir][serviceName]
    return new clientConstructor(endpoint, grpc.credentials.createInsecure())
  }

  get spinner() {
    const {flags} = this.parse()
    const nope = () => {}
    if (flags.quiet) {
      return {start: nope, stop: (message?: string) => message ? this.log(message) : null, status: null}
    }
    if (flags.silent) {
      return {start: nope, stop: nope, status: null}
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

  async executeAndCaptureError(serviceID: string, taskKey: string, data: object = {}, tags: string[] = []): Promise<ExecutionResult> {
    this.debug(`Execute task ${taskKey} from ${serviceID} with ${JSON.stringify(data)}`)
    try {
      const result = await this.mesg.executeTaskAndWaitResult({
        serviceID,
        taskKey,
        inputData: JSON.stringify(data),
        executionTags: [...tags, 'cli']
      })
      this.debug(`Receiving result of ${result.executionHash}, ${result.taskKey} => ${result.outputData}`)
      if (result.error) {
        throw new Error(result.error)
      }
      return {
        data: JSON.parse(result.outputData)
      }
    } catch (e) {
      this.error(e.message)
      throw new Error(e.message)
    }
  }

  async unaryCall(method: UNARY_METHODS, data: object = {}): Promise<any> {
    this.debug(`Call MESG Engine API ${method} with ${JSON.stringify(data)}`)
    return new Promise((resolve, reject) => this.mesg.api[method](data, (error: Error, res: any) => error
      ? reject(error)
      : resolve(res)))
  }

  listenEvent(serviceID: string, event: string): Stream<EventData> {
    this.debug(`Listening to events ${event} from ${serviceID}`)
    const stream = this.mesg.listenEvent({
      eventFilter: event,
      serviceID
    })
    return stream
      .on('error', (err: Error) => {
        stream.cancel()
        throw err
      })
      .on('metadata', metadata => {
        const err = checkStreamReady(metadata)
        if (err === errNoStatus) return
        if (err) {
          stream.destroy(err)
          return
        }
      })
  }
}
