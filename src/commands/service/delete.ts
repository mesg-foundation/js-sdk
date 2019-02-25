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

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDelete)
    if (!flags['keep-data']) {
      cli.warn('This will delete all data associated to this service')
    }
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return null
    this.spinner.start(`Delete service ${args.SERVICE}`)
    await this.unaryCall('DeleteService', {
      serviceID: args.SERVICE,
      deleteData: !flags['keep-data'],
    })
    this.spinner.stop(args.SERVICE)
    return args.SERVICE
  }
}
