import { flags, Command } from '@oclif/command'
import { readFileSync } from 'fs'
import LCD from '@mesg/api'
import * as grpc from 'grpc'
import { decode } from '@mesg/orchestrator/lib/encoder'
import Listr from 'listr'
import { resolveSIDRunner } from "@mesg/api/lib/util/resolve";
import { IRunner } from '@mesg/api/lib/runner'
import { convert } from '../../utils/input'
import Orchestrator from '@mesg/orchestrator'
import * as Type from '@mesg/orchestrator/lib/typedef/execution'
import { CreateRequest, StreamRequest, Status } from '@mesg/orchestrator/lib/execution'
import sign from '../../utils/sign'
import uuid from 'uuid'
import { generateConfig } from '../../utils/config'
import { toStruct } from '@mesg/api/lib/struct'
import styledJSON from 'cli-ux/lib/styled/json'
import { ITask } from '@mesg/api/lib/service'

export default class Execute extends Command {
  static description = 'Execute a task on a running service'

  static flags = {
    json: flags.string({ char: 'j', description: 'Path to a JSON file containing the task inputs' }),
    data: flags.string({
      char: 'd',
      description: 'Task inputs',
      multiple: true,
      helpValue: 'key=value'
    }),
    eventHash: flags.string({
      description: 'Event hash to create the execution with'
    }),
  }

  static args = [{
    name: 'RUNNER_HASH',
    required: true,
    description: 'The hash of the runner that will execute this execution'
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  private lcd = new LCD(`http://localhost:1317`)
  private orchestrator = new Orchestrator(`localhost:50052`)

  async run() {
    const { args, flags } = this.parse(Execute)

    const id = uuid()

    let runner: IRunner
    let task: ITask
    let inputs: { [key: string]: any }
    let logs: grpc.ClientReadableStream<Type.mesg.types.IExecution>
    let execution: Type.mesg.types.IExecution

    const config = generateConfig(this.config.dataDir)

    const tasks = new Listr([
      {
        title: 'Validating task',
        task: async () => {
          try {
            runner = await this.lcd.runner.get(args.RUNNER_HASH)
          } catch (err) {
            const hash = await resolveSIDRunner(this.lcd, args.RUNNER_HASH)
            runner = await this.lcd.runner.get(hash)
          }
          const instance = await this.lcd.instance.get(runner.instanceHash)
          const service = await this.lcd.service.get(instance.serviceHash)
          task = service.tasks.find(x => x.key === args.TASK)
          if (!task) this.error(`The task ${args.TASK} does not exist in service '${service.hash}'`)
        }
      },
      {
        title: 'Converting inputs',
        task: () => {
          inputs = convert(task, flags.json
            ? JSON.parse(readFileSync(flags.json).toString())
            : (flags.data || []).reduce((acc, item) => ({
              ...acc,
              [item.split('=')[0]]: item.split('=')[1]
            }), {}))
        }
      },
      {
        title: 'Listening for result',
        task: async () => {
          const payload: StreamRequest = {
            filter: {
              executorHash: runner.hash,
              instanceHash: runner.instanceHash,
              tags: [id],
              taskKey: args.TASK,
              statuses: [Status.Completed, Status.Failed]
            }
          }
          logs = await this.orchestrator.execution.stream(payload, sign(payload, config.mnemonic))
        }
      },
      {
        title: 'Executing task',
        task: async () => {
          const payload: CreateRequest = {
            executorHash: runner.hash,
            inputs: inputs,
            taskKey: args.TASK,
            price: '10000atto',
            tags: [id]
          }
          await this.orchestrator.execution.create(
            payload,
            sign({ ...payload, inputs: toStruct(payload.inputs) }, config.mnemonic)
          )
          return new Promise((resolve, reject) => {
            logs.once('data', (exec: Type.mesg.types.IExecution) => {
              execution = exec
              execution.status === Status.Completed ? resolve(execution) : reject(new Error(execution.error))
            })
          })
        }
      }
    ])
    await tasks.run()

    styledJSON(decode(execution.outputs))
    process.exit(0)
  }
}
