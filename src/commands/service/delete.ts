import {flags} from '@oclif/command'
import cli from 'cli-ux'
import * as base58 from 'mesg-js/lib/util/base58'

import Command from '../../root-command'
import serviceResolver from '../../utils/service-resolver'

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
    this.spinner.start('Deleting service(s)')
    for (const hash of argv) {
      const serviceHash = await serviceResolver(this.api, hash)
      this.spinner.status = base58.encode(serviceHash)
      await this.api.service.delete({hash: serviceHash})
    }
    this.spinner.stop()
    return argv
  }
}
