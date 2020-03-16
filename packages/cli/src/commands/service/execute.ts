import { flags, Command } from '@oclif/command'
import { readFileSync } from 'fs'
import { ExecutionCreateOutputs } from '@mesg/api/lib/execution'
import { cli } from 'cli-ux'
import LCD from '@mesg/api/lib/lcd'
import Application from '@mesg/application'
import API from '@mesg/api'
import Listr from 'listr'
import { IValidateTasks, IConvertInput, IExecute, validateTask, convertInput, execute } from '../../tasks'

export default class ServiceExecute extends Command {
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
    const { args, flags } = this.parse(ServiceExecute)
    const app = new Application(new API(`localhost:50052`))

    const tasks = new Listr<IValidateTasks | IConvertInput | IExecute>([
      validateTask,
      convertInput,
      execute
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

    const result = app.decodeData((res as IExecute).result.outputs)
    cli.styledJSON(result)
    return result
  }
}
