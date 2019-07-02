import cli from 'cli-ux'

import Command from '../../root-command'
import { Instance } from 'mesg-js/lib/api';

export default class InstanceList extends Command {
  static description = 'List all instances'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Instance[]> {
    const { flags } = this.parse(InstanceList)
    const { instances } = await this.api.instance.list({})
    if (!instances) return []
    cli.table(instances, {
      hash: { header: 'HASH', get: x => x.hash },
      sid: { header: 'SERVICE', get: x => x.serviceHash },
    }, { printLine: this.log, ...flags })
    return instances
  }
}
