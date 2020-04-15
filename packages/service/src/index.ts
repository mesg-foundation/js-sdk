import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import Runner from '@mesg/orchestrator/lib/runner'
import { decode, encode } from '@mesg/orchestrator/lib/encoder'
import { mesg } from './typedef/execution';
import { EventEmitter } from 'events'

type Options = {
  endpoint?: string
  signature?: string
}

class Service {
  private tasks: Tasks
  private _client: Promise<any>
  private _token: grpc.Metadata

  constructor(options: Options = {}) {
    this._client = this.register(
      options.signature || process.env.MESG_REGISTER_SIGNATURE,
      options.endpoint || process.env.MESG_ENDPOINT,
      process.env.MESG_SERVICE_HASH,
      process.env.MESG_ENV_HASH
    )
  }

  async register(signature: string, endpoint: string, serviceHash: string, envHash: string): Promise<grpc.GrpcObject> {
    const runner = new Runner(endpoint)
    const { token } = await runner.register({ serviceHash, envHash }, signature)
    this._token = new grpc.Metadata()
    this._token.add('mesg_credential_token', token)
    const { mesg } = grpc.loadPackageDefinition(protoLoader.loadSync(path.join(__dirname, 'runner', 'runner.proto'), {
      includeDirs: [__dirname]
    })) as any
    return new mesg.grpc.runner.Runner(endpoint, grpc.credentials.createInsecure())
  }

  listenTask({ ...tasks }: Tasks): EventEmitter {
    const res = new EventEmitter()
    if (this.tasks) {
      throw new Error(`listenTask should be called only once`);
    }
    this.tasks = tasks;
    this._client.then(client => {
      const stream = client.Execution({}, this._token) as grpc.ClientWritableStream<any>
      stream.on('data', x => res.emit('data', x))
      stream.on('error', x => res.emit('error', x))
      stream.on('close', () => res.emit('close'))
      stream.on('finish', () => res.emit('finish'))
    })
    res.on('data', this.handleTaskData.bind(this))
    return res
  }

  async emitEvent(event: string, data: EventData): Promise<{}> {
    if (!data) throw new Error('data object must be send while emitting event')
    return this.unaryCall('Event', {
      key: event,
      data: encode(data)
    }, this._token)
  }

  private async handleTaskData(execution: mesg.types.IExecution) {
    const callback = this.tasks[execution.taskKey];
    if (!callback) {
      throw new Error(`Task ${execution.taskKey} is not defined in your services`);
    }
    try {
      const outputs = await callback(decode(execution.inputs));
      return this.unaryCall('Result', {
        executionHash: execution.hash,
        outputs: encode(outputs)
      }, this._token)
    } catch (err) {
      const error = err.message;
      return this.unaryCall('Result', {
        executionHash: execution.hash,
        error
      }, this._token)
    }
  }

  private async unaryCall(method: string, arg: any, metadata: grpc.Metadata): Promise<any> {
    const client = await this._client
    return new Promise((resolve, reject) => {
      client[method](arg, metadata, (err: Error, res: any) => err ? reject(err) : resolve(res))
    })
  }
}

interface Tasks {
  [task: string]: (inputs: TaskInputs) => TaskOutputs | Promise<TaskOutputs>
}

interface TaskOutputs {
  [key: string]: any
}

interface TaskInputs {
  [key: string]: any
}

interface EventData {
  [key: string]: any
}

export default Service;
(module).exports = Service;
export {
  Tasks,
  TaskInputs,
}
