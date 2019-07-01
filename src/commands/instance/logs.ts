import { flags } from '@oclif/command'
import chalk from 'chalk'

import Command from '../../root-command'
import { ExecutionStatus, Execution, Event } from 'mesg-js/lib/api';

export interface Log {
  dependency: string
  data: Buffer
}

export default class InstanceLogs extends Command {
  static description = 'Show logs of a service'

  static flags = {
    ...Command.flags,
    // dependency: flags.string({
    //   char: 'd',
    //   description: 'Name of the dependency to show the logs from',
    //   multiple: true
    // }),
    'no-events': flags.boolean({
      description: 'Remove events from the logs'
    }),
    'no-results': flags.boolean({
      description: 'Remove results from the logs'
    }),
    event: flags.string({
      description: 'Filter specific events in the logs'
    }),
    task: flags.string({
      description: 'Filter specific task results in the logs'
    })
  }

  static args = [{
    name: 'HASH',
    required: true,
  }]

  async run() {
    const { args, flags } = this.parse(InstanceLogs)
    // const stream = this.mesg.api.ServiceLogs({
    //   serviceID: args.HASH,
    //   dependencies: flags.dependency,
    // }) as Stream<Log>
    // stream.on('data', response => {
    //   const dependency = response.dependency
    //   this.log(chalk.yellow(dependency + ' | '), response.data.toString().replace('\n', ''))
    // })
    // stream.on('error', (error: Error) => {
    //   throw error
    // })

    if (!flags['no-results']) {
      this.api.execution.stream({
        filter: {
          instanceHash: args.HASH,
          statuses: [
            ExecutionStatus.COMPLETED,
            ExecutionStatus.FAILED,
          ],
          taskKey: flags.task
        }
      })
        .on('data', data => this.log(this.formatResult(data)))
        .on('error', (error: Error) => { throw error })
    }

    if (!flags['no-events']) {
      this.api.event.stream({
        filter: {
          instanceHash: args.HASH,
          key: flags.event,
        }
      })
        .on('data', (data: any) => this.log(this.formatEvent(data)))
        .on('error', (error: Error) => { throw error })
    }

    // return stream
  }

  formatEvent(event: Event) {
    return `EVENT[${event.key}]: ` + chalk.gray(event.data)
  }
  formatResult(execution: Execution) {
    if (execution.error) {
      return `RESULT[${execution.taskKey}]: ` + chalk.red('ERROR:', execution.error)
    }
    return `RESULT[${execution.taskKey}]: ` + chalk.gray(execution.outputs || '')
  }
}
