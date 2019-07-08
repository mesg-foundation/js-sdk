import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'

export default class ServiceStop extends Command {
  static description = 'Stop one or more running service'

  static flags = {
    ...Command.flags,
    'delete-data': flags.boolean({
      description: 'Delete runnign service persistent data',
      default: false,
    }),
    confirm: flags.boolean({
      description: 'Confirm deletion',
      default: false,
    })
  }

  static strict = false

  static args = [{
    name: 'INSTANCE_HASH...',
    required: true,
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(ServiceStop)
    if (flags['delete-data'] && !flags.confirm) {
      cli.warn('This will delete all the data associated with this running service')
      if (!await cli.confirm('Are you sure?')) return []
    }
    this.spinner.start('Stop running services')
    for (const hash of argv) {
      await this.api.instance.delete({hash, deleteData: flags['delete-data']})
    }
    this.spinner.stop(argv.join(', '))
    return argv
  }
}
