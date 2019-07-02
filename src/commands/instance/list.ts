import cli from 'cli-ux'
import {Instance} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class InstanceList extends Command {
  static description = 'List all instances'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Instance[]> {
    const {flags} = this.parse(InstanceList)
    const {instances} = await this.api.instance.list({})
    const {services} = await this.api.service.list({})
    if (!instances) return []
    cli.table(instances, {
      hash: {header: 'HASH', get: x => x.hash},
      serviceHash: {header: 'SERVICE_HASH', get: x => x.serviceHash},
      service: {
        header: 'SERVICE',
        get: x => {
          const service = (services || []).find(y => y.hash === x.serviceHash)
          return service ? service.name : ''
        }
      }
    }, {printLine: this.log, ...flags})
    return instances
  }
}
