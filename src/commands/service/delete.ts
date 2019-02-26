import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../service-command'

export default class ServiceDelete extends Command {
  static description = 'Delete one or many services'

  static aliases = ['service:rm', 'service:destroy']

  static flags = {
    ...Command.flags,
    'keep-data': flags.boolean({description: 'Do not delete services\' persistent data'}),
    confirm: flags.boolean({description: 'Confirm delete', default: false})
  }

  static strict = false

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(ServiceDelete)
    if (!flags['keep-data']) {
      cli.warn('This will delete all data associated to this service')
    }
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Delete service')
    for (const arg of argv) {
      this.spinner.status = arg
      await this.unaryCall('DeleteService', {
        serviceID: arg,
        deleteData: !flags['keep-data'],
      })
    }
    this.spinner.stop()
    return argv
  }
}
