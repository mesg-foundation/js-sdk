import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'

export default class ServiceDelete extends Command {
  static description = 'Delete one or many services'

  static flags = {
    ...Command.flags,
    confirm: flags.boolean({description: 'Confirm deletion', default: false})
  }

  static strict = false

  static args = [{
    name: 'SERVICE_HASH...',
    required: true,
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(ServiceDelete)
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Delete services')
    for (const hash of argv) {
      this.spinner.status = hash
      await this.api.service.delete({hash})
    }
    this.spinner.stop()
    return argv
  }
}
