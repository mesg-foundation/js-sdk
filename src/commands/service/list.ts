import cli from 'cli-ux'
import {Instance} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class ServiceList extends Command {
  static description = 'List all instances'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Instance[]> {
    const {flags} = this.parse(ServiceList)
    const {services} = await this.api.service.list({})
    const {instances} = await this.api.instance.list({})
    if (!services) return []
    cli.table(services, {
      hash: {header: 'HASH', get: x => x.hash},
      sid: {header: 'SID', get: x => x.sid},
      instances: {
        header: 'INSTANCES',
        get: x => (instances || [])
          .filter(y => y.serviceHash === x.hash)
          .map(x => x.hash)
          .join('\n')
      }
    }, {printLine: this.log, ...flags})
    return instances
  }
}
