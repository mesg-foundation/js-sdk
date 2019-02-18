import {flags} from '@oclif/command'
import chalk from 'chalk'

import Command from '../../service-command'

export default class ServiceLog extends Command {
  static description = 'Show logs of a service'

  static flags = {
    ...Command.flags,
    dependency: flags.string({
      char: 'd',
      description: 'Name of the dependency to show the logs from',
      multiple: true
    }),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceLog)
    const stream = this.mesg.api.ServiceLogs({
      serviceID: args.SERVICE,
      dependencies: flags.dependency,
    })
    stream.on('data', (response: any) => {
      const dependency = response.dependency
      this.log(chalk.yellow(dependency + ' | '), response.data.toString().replace('\n', ''))
    })
    stream.on('error', (error: Error) => { throw error })

    this.mesg.api.ListenResult({serviceID: args.SERVICE})
      .on('data', (data: any) => this.log(this.formatResult(data)))
      .on('error', (error: Error) => { throw error })

    this.mesg.api.ListenEvent({serviceID: args.SERVICE})
      .on('data', (data: any) => this.log(this.formatEvent(data)))
      .on('error', (error: Error) => { throw error })
  }

  formatEvent(event: any) {
    return `EVENT[${event.eventKey}]: ` + chalk.gray(event.eventData)
  }
  formatResult(result: any) {
    return `RESULT[${result.taskKey}][${result.outputKey}]: ` + chalk.gray(result.outputData)
  }
}
