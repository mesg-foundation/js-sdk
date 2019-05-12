import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {application} from 'mesg-js'
import {EventData, Stream} from 'mesg-js/lib/application'
import {checkStreamReady, errNoStatus} from 'mesg-js/lib/util/grpc'
import {format, inspect} from 'util'

type UNARY_METHODS = 'DeleteService'
  | 'GetService'
  | 'ListServices'
  | 'StartService'
  | 'StopService'
  | 'Info'

export interface ExecutionResult {
  output: string
  data: any
}

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({char: 'q'}),
    silent: flags.boolean(),
  }

  protected mesg = application({
    endpoint: 'localhost:50052'
  })

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

  async execute(serviceID: string, taskKey: string, data: object = {}): Promise<ExecutionResult> {
    this.debug(`Execute task ${taskKey} from ${serviceID} with ${JSON.stringify(data)}`)
    const result = await this.mesg.executeTaskAndWaitResult({
      serviceID,
      taskKey,
      inputData: JSON.stringify(data),
      executionTags: ['cli']
    })
    if (result.error) {
      this.error(result.error)
      throw result.error
    }
    this.debug(`Receiving result of ${result.executionID}, ${result.outputKey} ${result.taskKey} => ${result.outputData}`)
    return {
      data: JSON.parse(result.outputData),
      output: result.outputKey,
    }
  }

  async executeAndCaptureError(serviceID: string, taskKey: string, data: object = {}): Promise<ExecutionResult> {
    const result = await this.execute(serviceID, taskKey, data)
    if (result.output === 'error') {
      this.error(result.data.message)
      throw new Error(result.data.message)
    }
    return result
  }

  async unaryCall(method: UNARY_METHODS, data: object = {}): Promise<any> {
    this.debug(`Call MESG Core API ${method} with ${JSON.stringify(data)}`)
    return new Promise((resolve, reject) => this.mesg.api[method](data, (error: Error, res: any) => error
      ? reject(error)
      : resolve(res)))
  }

  listenEventOnce(serviceID: string, event: string, filter?: (data: any) => boolean): Promise<any> {
    return new Promise((resolve: any) => {
      const stream = this.listenEvent(serviceID, event)
      stream.on('end', () => stream.cancel())
      stream.on('data', (data: EventData) => {
        const event = JSON.parse(data.eventData)
        if (!filter || filter(event)) {
          stream.cancel()
          resolve(event)
        }
      })
    })
  }

  listenEvent(serviceID: string, event: string): Stream<EventData> {
    this.debug(`Listenning to events ${event} from ${serviceID}`)
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
