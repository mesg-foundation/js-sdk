import {flags} from '@oclif/command'
import chalk from 'chalk'
import {ExecutionStatus} from '@mesg/api/lib/types'
import {IEvent} from '@mesg/api/lib/event'
import {IExecution} from '@mesg/api/lib/execution'
import * as base58 from '@mesg/api/lib/util/base58'
import {decode} from '@mesg/api/lib/util/encoder'
import {Docker} from 'node-docker-api'

import Command from '../../root-command'
import {parseLog} from '../../utils/docker'
import {runnerResolver} from '../../utils/resolver'

export interface Log {
  dependency: string
  data: Buffer
}

export default class ServiceLogs extends Command {
  static description = 'Fetch the logs of a service'

  static flags = {
    ...Command.flags,
    // dependency: flags.string({
    //   char: 'd',
    //   description: 'Name of the dependency to show the logs from',
    //   multiple: true
    // }),
    events: flags.boolean({
      description: 'Display events',
      allowNo: true,
      default: true
    }),
    results: flags.boolean({
      description: 'Display results',
      allowNo: true,
      default: true
    }),
    event: flags.string({
      description: 'Display a specific event'
    }),
    task: flags.string({
      description: 'Display a specific task results'
    }),
    tail: flags.integer({
      description: 'Display the last N lines',
      default: 10000
    }),
    follow: flags.boolean({
      description: 'Follow log output',
      allowNo: true,
      default: true
    })
  }

  static args = [{
    name: 'RUNNER_HASH',
    required: true,
  }]

  private readonly docker: Docker = new Docker(null)

  async run() {
    const {args, flags} = this.parse(ServiceLogs)

    const runnerHash = await runnerResolver(this.api, args.RUNNER_HASH)
    const runner = await this.api.runner.get({hash: runnerHash})
    if (!runner.hash) {
      throw new Error('runner is invalid')
    }

    const streams: (() => any)[] = []

    const dockerServices = await this.docker.service.list({
      filters: {
        label: [`mesg.runner=${base58.encode(runnerHash)}`]
      }
    })
    for (const service of dockerServices) {
      const labels = (service.data as any).Spec.Labels
      const name = [labels['mesg.sid'], labels['mesg.dependency']].join('/')
      const logs = (await service.logs({
        stderr: true,
        stdout: true,
        follow: flags.follow,
        tail: flags.tail && flags.tail >= 0 ? flags.tail : 'all'
      }) as any)
      streams.push(() => logs.destroy())
      logs
        .on('data', (buffer: Buffer) => parseLog(buffer).forEach(x => this.log(chalk.gray(name + ':'), x)))
        .on('error', (error: Error) => { this.warn('Docker log stream error: ' + error.message) })
    }

    if (flags.results) {
      const results = this.api.execution.stream({
        filter: {
          executorHash: runnerHash,
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
        .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
    }

    if (flags.events) {
      const events = this.api.event.stream({
        filter: {
          instanceHash: runner.instanceHash,
          key: flags.event,
        }
      })
      streams.push(() => events.cancel())
      events
        .on('data', (data: any) => this.log(this.formatEvent(data)))
        .on('error', (error: Error) => { this.warn('Event stream error: ' + error.message) })
    }

    return {
      destroy: () => {
        streams.forEach(s => s())
      }
    }
  }

  formatEvent(event: IEvent) {
    if (!event.data) return
    return `EVENT[${event.key}]: ` + chalk.gray(JSON.stringify(decode(event.data)))
  }
  formatResult(execution: IExecution) {
    if (execution.error) {
      return `RESULT[${execution.taskKey}]: ` + chalk.red('ERROR:', execution.error)
    }
    if (!execution.outputs) return
    return `RESULT[${execution.taskKey}]: ` + chalk.gray(JSON.stringify(decode(execution.outputs)))
  }
}
