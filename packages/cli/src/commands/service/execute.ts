import { flags, Command } from '@oclif/command'
import { readFileSync } from 'fs'
import { cli } from 'cli-ux'
import LCD from '@mesg/api'
import { decode } from '@mesg/api/lib/util/encoder'
import Listr from 'listr'
import { resolveSIDRunner } from "@mesg/api/lib/util/resolve";
import { ITask } from '@mesg/api/lib/service'
import { IRunner } from '@mesg/api/lib/runner'
import { IExecution } from '@mesg/api/lib/execution'
import { convert } from '../../utils/input'

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

  async run() {
    const { args, flags } = this.parse(Execute)

    let runner: IRunner
    let task: ITask
    let inputs: any
    let execution: IExecution

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
        title: 'Executing task',
        task: async () => {
          // execution = await this.app.executeTaskAndWaitResult({
          //   eventHash: base58.decode(flags.eventHash || '6aUPZhmnFKiSsHXRaddbnqsKKi9KogbQNiKUcpivaohb'),
          //   executorHash: base58.decode(runner.hash),
          //   inputs,
          //   tags: ['CLI'],
          //   taskKey: args.TASK
          // })
        }
      }
    ])
    await tasks.run()

    cli.styledJSON(decode(execution.outputs))
  }
}
