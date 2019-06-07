import {flags} from '@oclif/command'
import chalk from 'chalk'
import {Stream} from 'mesg-js/lib/service'

import Command from '../../service-command'

export interface Log {
  dependency: string
  data: Buffer
}

export default class ServiceLog extends Command {
  static description = 'Show logs of a service'

  static flags = {
    ...Command.flags,
    dependency: flags.string({
      char: 'd',
      description: 'Name of the dependency to show the logs from',
      multiple: true
    }),
    'no-events': flags.boolean({
      description: 'Remove events from the logs'
    }),
    'no-results': flags.boolean({
      description: 'Remove results from the logs'
    }),
    event: flags.string({
      description: 'Filter specific events in the logs',
      multiple: true
    }),
    task: flags.string({
      description: 'Filter specific task results in the logs',
      multiple: true
    })
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run(): Promise<Stream<Log>> {
    const {args, flags} = this.parse(ServiceLog)
    const stream = this.mesg.api.ServiceLogs({
      serviceID: args.SERVICE,
      dependencies: flags.dependency,
    }) as Stream<Log>
    stream.on('data', response => {
      const dependency = response.dependency
      this.log(chalk.yellow(dependency + ' | '), response.data.toString().replace('\n', ''))
    })
    stream.on('error', (error: Error) => {
      throw error
    })

    if (!flags['no-results']) {
      const tasks = flags.task || []
      this.mesg.api.ListenResult({serviceID: args.SERVICE})
        .on('data', (data: any) => {
          if (tasks.length > 0 && !tasks.includes(data.taskKey)) return
          this.log(this.formatResult(data))
        })
        .on('error', (error: Error) => {
          throw error
        })
    }

    if (!flags['no-events']) {
      const events = flags.event || []
      this.mesg.api.ListenEvent({serviceID: args.SERVICE})
        .on('data', (data: any) => {
          if (events.length > 0 && !events.includes(data.evenKey)) return
          this.log(this.formatEvent(data))
        })
        .on('error', (error: Error) => {
          throw error
        })
    }

    return stream
  }

  formatEvent(event: any) {
    return `EVENT[${event.eventKey}]: ` + chalk.gray(event.eventData)
  }
  formatResult(result: any) {
    if (result.error) {
      return `RESULT[${result.taskKey}]: ` + chalk.red('ERROR:', result.error)
    }
    return `RESULT[${result.taskKey}]: ` + chalk.gray(result.outputData)
  }
}
