import * as YAML from 'js-yaml'
import * as fs from 'fs'
import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import Runner from '@mesg/orchestrator/lib/runner'
import { decode, encode } from '@mesg/api/lib/util/encoder'
import { IExecution } from '@mesg/api/lib/execution';
import { EventCreateOutputs } from '@mesg/api/lib/event';
import { EventEmitter } from 'events'

type Options = {
  endpoint?: string
  signature?: string
  definition?: any
}

class Service {
  private definition: any
  private tasks: Tasks
  private _client: Promise<any>
  private _token: grpc.Metadata

  constructor(options: Options = {}) {
    this.definition = options.definition || YAML.safeLoad(fs.readFileSync('./mesg.yml').toString());
    this._client = this.register(
      options.signature || process.env.MESG_REGISTER_SIGNATURE,
      options.endpoint || process.env.MESG_ENDPOINT,
      process.env.MESG_SERVICE_HASH,
      process.env.MESG_ENV_HASH
    )
  }

  async register(signature: string, endpoint: string, serviceHash: string, envHash: string): Promise<grpc.GrpcObject> {
    const runner = new Runner(endpoint)
    const { token } = await runner.register(serviceHash, envHash, signature)
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
    this.validateTaskNames();
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

  async emitEvent(event: string, data: EventData): EventCreateOutputs {
    if (!data) throw new Error('data object must be send while emitting event')
    return this.unaryCall('Event', {
      key: event,
      data: encode(data)
    }, this._token)
  }

  private async handleTaskData({ hash, taskKey, inputs }: IExecution) {
    const callback = this.tasks[taskKey];
    if (!callback) {
      throw new Error(`Task ${taskKey} is not defined in your services`);
    }
    try {
      const outputs = await callback(decode(inputs));
      return this.unaryCall('Result', {
        executionHash: hash,
        outputs: encode(outputs)
      }, this._token)
    } catch (err) {
      const error = err.message;
      return this.unaryCall('Result', {
        executionHash: hash,
        error
      }, this._token)
    }
  }

  private validateTaskNames() {
    const nonDescribedTasks = Object.keys(this.tasks).filter(x => !this.definition.tasks[x]);
    if (nonDescribedTasks.length > 0) {
      throw new Error(`The following tasks are not present in the mesg.yml: ${nonDescribedTasks.join(', ')}`);
    }
    const nonHandledTasks = Object.keys(this.definition.tasks).filter(x => !this.tasks[x]);
    if (nonHandledTasks.length > 0) {
      console.warn(`WARNING: The following tasks described in the mesg.yml haven't been implemented: ${nonHandledTasks.join(', ')}`);
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
