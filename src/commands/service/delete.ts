import { flags } from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'

export default class ServiceDelete extends Command {
  static description = 'Delete one or many services'

  static aliases = ['service:rm', 'service:destroy']

  static flags = {
    ...Command.flags,
    confirm: flags.boolean({ description: 'Confirm delete', default: false })
  }

  static strict = false

  static args = [{
    name: 'HASH',
    required: true,
  }]

  async run(): Promise<string[]> {
    const { argv, flags } = this.parse(ServiceDelete)
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Delete service')
    for (const hash of argv) {
      this.spinner.status = hash
      await this.api.service.delete({ hash })
    }
    this.spinner.stop()
    return argv
  }
}
