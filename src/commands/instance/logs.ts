import {flags} from '@oclif/command'
import chalk from 'chalk'
import {Event, Execution, ExecutionStatus} from 'mesg-js/lib/api'
import {Docker} from 'node-docker-api'

import Command from '../../root-command'
import {parseLog} from '../../utils/docker'

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
    events: flags.boolean({
      description: 'Remove events from the logs',
      allowNo: true,
      default: true
    }),
    results: flags.boolean({
      description: 'Remove results from the logs',
      allowNo: true,
      default: true
    }),
    event: flags.string({
      description: 'Filter specific events in the logs'
    }),
    task: flags.string({
      description: 'Filter specific task results in the logs'
    }),
    tail: flags.integer({
      description: 'Output specified number of lines at the end of logs',
      default: -1
    }),
    follow: flags.boolean({
      description: 'Follow logs',
      allowNo: true,
      default: true
    })
  }

  static args = [{
    name: 'HASH',
    required: true,
  }]

  private readonly docker: Docker = new Docker(null)

  async run() {
    const {args, flags} = this.parse(InstanceLogs)

    const dockerServices = await this.docker.service.list({
      filters: {
        label: [`mesg.hash=${args.HASH}`]
      }
    })
    for (const service of dockerServices) {
      const logs = await service.logs({
        stderr: true,
        stdout: true,
        follow: flags.follow,
        tail: flags.tail && flags.tail >= 0 ? flags.tail : 'all'
      })
      logs
        .on('data', (buffer: Buffer) => parseLog(buffer).forEach(x => this.log(x)))
        .on('error', (error: Error) => { throw error })
    }

    if (flags.results) {
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

    if (flags.events) {
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
