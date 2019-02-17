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
  }
}
