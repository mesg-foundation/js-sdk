import * as YAML from 'js-yaml'
import * as fs from 'fs'
import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import { decode, encode } from '@mesg/api/lib/util/encoder'
import { IExecution } from '@mesg/api/lib/execution';
import { EventEmitter } from 'events'

type Options = {
  endpoint?: string
  payload?: string
  definition?: any
}

class Service {
  private definition: any
  private tasks: Tasks
  private _client: any
  private credential: Promise<grpc.Metadata>

  constructor(options: Options = {}) {
    this.definition = options.definition || YAML.safeLoad(fs.readFileSync('./mesg.yml').toString());
    const protoDefinition = grpc.loadPackageDefinition(protoLoader.loadSync(path.join(__dirname, 'runner.proto'))) as any
    this._client = new protoDefinition.mesg.grpc.runner.Runner(options.endpoint || process.env.MESG_ENDPOINT, grpc.credentials.createInsecure())
    this.credential = this.register(options.payload || process.env.MESG_REGISTER_PAYLOAD)
  }

  async register(payload: string): Promise<grpc.Metadata> {
    const res = await this.unaryCall('Register', { payload })
    const meta = new grpc.Metadata()
    meta.add('mesg_credential_token', res.token)
    return meta
  }

  listenTask({ ...tasks }: Tasks): EventEmitter {
    const res = new EventEmitter()
    if (this.tasks) {
      throw new Error(`listenTask should be called only once`);
    }
    this.tasks = tasks;
    this.validateTaskNames();
    this.credential.then(token => {
      const stream = this._client.Execution({}, token) as grpc.ClientWritableStream<any>
      stream.on('data', x => res.emit('data', x))
      stream.on('error', x => res.emit('error', x))
      stream.on('close', () => res.emit('close'))
      stream.on('finish', () => res.emit('finish'))
    })
    res.on('data', this.handleTaskData.bind(this))
    return res
  }

  async emitEvent(event: string, data: EventData): Promise<any> {
    if (!data) throw new Error('data object must be send while emitting event')
    return this.unaryCall('Event', {
      key: event,
      data: encode(data)
    }, await this.credential)
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
      }, await this.credential)
    } catch (err) {
      const error = err.message;
      return this.unaryCall('Result', {
        executionHash: hash,
        error
      }, await this.credential)
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

  private async unaryCall(method: string, arg: any, credentials?: grpc.Metadata): Promise<any> {
    return new Promise((resolve, reject) => {
      if (credentials) {
        this._client[method](arg, credentials, (err: Error, res: any) => err ? reject(err) : resolve(res))
      } else {
        this._client[method](arg, (err: Error, res: any) => err ? reject(err) : resolve(res))
      }
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
