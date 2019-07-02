import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'

export default class InstanceDelete extends Command {
  static description = 'Delete an instance'

  static flags = {
    ...Command.flags,
    'delete-data': flags.boolean({
      description: 'Delete instances\' persistent data',
      default: false,
    }),
    confirm: flags.boolean({description: 'Confirm delete', default: false})
  }

  static strict = false

  static args = [{
    name: 'HASH',
    required: true,
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(InstanceDelete)
    if (flags['delete-data']) {
      cli.warn('This will delete all data associated to this instance')
    }
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Delete instance')
    for (const hash of argv) {
      this.spinner.status = hash
      await this.api.instance.delete({hash, deleteData: flags['delete-data']})
    }
    this.spinner.stop(argv.join(', '))
    return argv
  }
}
