import * as YAML from 'js-yaml'
import * as fs from 'fs'
import API from '@mesg/api';
import { IApi } from '@mesg/api/lib/types';
import * as bs58 from '@mesg/api/lib/util/base58';
import { decode, encode } from '@mesg/api/lib/util/encoder'
import { ExecutionStreamOutputs, IExecution } from '@mesg/api/lib/execution';
import { ExecutionStatus, hash } from '@mesg/api/lib/types';
import { EventCreateOutputs } from '@mesg/api/lib/event';

type Options = {
  runnerHash?: hash
  instanceHash?: hash
  definition?: any
  API?: IApi
}

class Service {
  // api gives access to low level gRPC calls.
  private API: IApi

  private runnerHash: hash
  private instanceHash: hash
  private definition: any
  private tasks: Tasks

  constructor(options: Options = {}) {
    this.definition = options.definition || YAML.safeLoad(fs.readFileSync('./mesg.yml').toString());
    this.API = options.API || new API(process.env.MESG_ENDPOINT);
    this.runnerHash = options.runnerHash || bs58.decode(process.env.MESG_RUNNER_HASH);
    this.instanceHash = options.instanceHash || bs58.decode(process.env.MESG_INSTANCE_HASH);
  }

  listenTask({ ...tasks }: Tasks): ExecutionStreamOutputs {
    if (this.tasks) {
      throw new Error(`listenTask should be called only once`);
    }
    this.tasks = tasks;
    this.validateTaskNames();
    const stream = this.API.execution.stream({
      filter: {
        executorHash: this.runnerHash,
        statuses: [ExecutionStatus.IN_PROGRESS],
      }
    });
    stream.on('data', this.handleTaskData.bind(this));
    return stream;
  }

  emitEvent(event: string, data: EventData): EventCreateOutputs {
    if (!data) throw new Error('data object must be send while emitting event')
    return this.API.event.create({
      instanceHash: this.instanceHash,
      key: event,
      data: encode(data)
    })
  }

  private async handleTaskData({ hash, taskKey, inputs }: IExecution) {
    const callback = this.tasks[taskKey];
    if (!callback) {
      throw new Error(`Task ${taskKey} is not defined in your services`);
    }
    try {
      const outputs = await callback(decode(inputs));
      return this.API.execution.update({
        hash,
        outputs: encode(outputs)
      });
    } catch (err) {
      const error = err.message;
      return this.API.execution.update({ hash, error });
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
export {
  Tasks,
  TaskInputs,
}
