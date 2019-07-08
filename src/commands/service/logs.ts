import {flags} from '@oclif/command'
import chalk from 'chalk'
import {Event, Execution, ExecutionStatus} from 'mesg-js/lib/api'
import {resolveSID} from 'mesg-js/lib/util/resolve'
import {Docker} from 'node-docker-api'

import Command from '../../root-command'
import {parseLog} from '../../utils/docker'

export interface Log {
  dependency: string
  data: Buffer
}

export default class ServiceLogs extends Command {
  static description = 'Show logs of a service'

  static flags = {
    ...Command.flags,
    // dependency: flags.string({
    //   char: 'd',
    //   description: 'Name of the dependency to show the logs from',
    //   multiple: true
    // }),
    events: flags.boolean({
      description: 'Don\'t display events',
      allowNo: true,
      default: true
    }),
    results: flags.boolean({
      description: 'Don\'t display results',
      allowNo: true,
      default: true
    }),
    event: flags.string({
      description: 'Only display a specific event'
    }),
    task: flags.string({
      description: 'Only display a specific task results'
    }),
    tail: flags.integer({
      description: 'Output only specified number of lines',
      default: -1
    }),
    follow: flags.boolean({
      description: 'Continuously display logs',
      allowNo: true,
      default: true
    })
  }

  static args = [{
    name: 'INSTANCE_HASH',
    required: true,
  }]

  private readonly docker: Docker = new Docker(null)

  async run() {
    const {args, flags} = this.parse(ServiceLogs)

    const instanceHash = await resolveSID(this.api, args.INSTANCE_HASH)

    const streams: (() => any)[] = []

    const dockerServices = await this.docker.service.list({
      filters: {
        label: [`mesg.hash=${instanceHash}`]
      }
    })
    for (const service of dockerServices) {
      const logs = (await service.logs({
        stderr: true,
        stdout: true,
        follow: flags.follow,
        tail: flags.tail && flags.tail >= 0 ? flags.tail : 'all'
      }) as any)
      streams.push(() => logs.destroy())
      logs
        .on('data', (buffer: Buffer) => parseLog(buffer).forEach(x => this.log(x)))
        .on('error', (error: Error) => { this.warn('error in docker stream: ' + error.message) })
    }

    if (flags.results) {
      const results = this.api.execution.stream({
        filter: {
          instanceHash,
          statuses: [
            ExecutionStatus.COMPLETED,
            ExecutionStatus.FAILED,
          ],
          taskKey: flags.task
        }
      })
      streams.push(() => results.cancel())
      results
        .on('data', data => this.log(this.formatResult(data)))
        .on('error', (error: Error) => { this.warn('error in result stream: ' + error.message) })
    }

    if (flags.events) {
      const events = this.api.event.stream({
        filter: {
          instanceHash,
          key: flags.event,
        }
      })
      streams.push(() => events.cancel())
      events
        .on('data', (data: any) => this.log(this.formatEvent(data)))
        .on('error', (error: Error) => { this.warn('error in event stream: ' + error.message) })
    }

    return {
      destroy: () => {
        streams.forEach(s => s())
      }
    }
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
