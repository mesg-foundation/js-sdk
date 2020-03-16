import { flags, Command } from '@oclif/command'
import { readFileSync } from 'fs'
import { ExecutionCreateOutputs } from '@mesg/api/lib/execution'
import { cli } from 'cli-ux'
import LCD from '@mesg/api/lib/lcd'
import Application from '@mesg/application'
import API from '@mesg/api'
import Listr from 'listr'
import * as Execution from '../../tasks/execution'
import * as Runner from '../../tasks/runner'
import * as Service from '../../tasks/service'
import * as Instance from '../../tasks/instance'
import { IService } from '@mesg/api/lib/service-lcd'
import ServiceType from "@mesg/api/lib/typedef/service";

export type IValidateTask = { service: IService, taskKey: string, task?: ServiceType.mesg.types.Service.ITask }
export type Context = Runner.IGet | Instance.IGet | Service.IGet | IValidateTask | Execution.IConvertInput | Execution.IExecute

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

  async run(): ExecutionCreateOutputs {
    const { args, flags } = this.parse(Execute)
    const app = new Application(new API(`localhost:50052`))

    const tasks = new Listr<Context>([
      {
        title: 'Validate task',
        task: () => new Listr<Runner.IGet | Instance.IGet | Service.IGet | IValidateTask>([
          Runner.get,
          Instance.get,
          Service.get,
          {
            title: 'Validate task',
            task: (ctx: IValidateTask) => {
              ctx.task = ctx.service.tasks.find(x => x.key === ctx.taskKey)
              if (!ctx.task) throw new Error(`The task ${ctx.taskKey} does not exist in service '${ctx.service.hash}'`)
            }
          }
        ])
      },
      Execution.convertInput,
      Execution.execute,
    ])
    const res = await tasks.run({
      lcd: new LCD(`http://localhost:1317`),
      runnerHash: args.RUNNER_HASH,
      taskKey: args.TASK,
      app: app,
      data: flags.json
        ? JSON.parse(readFileSync(flags.json).toString())
        : (flags.data || []).reduce((acc, item) => ({
          ...acc,
          [item.split('=')[0]]: item.split('=')[1]
        }), {}),
      eventHash: flags.eventHash || '6aUPZhmnFKiSsHXRaddbnqsKKi9KogbQNiKUcpivaohb',
      tags: ['CLI'],
    })

    const result = app.decodeData((res as Execution.IExecute).result.outputs)
    cli.styledJSON(result)
    return result
  }
}
