import cli from 'cli-ux'

import Command from '../../root-command'
import { Service } from 'mesg-js/lib/api';

export default class ServiceList extends Command {
  static description = 'List all services'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Service[]> {
    const { flags } = this.parse(ServiceList)
    const { services } = await this.api.service.list({})
    if (!services) return []
    cli.table(services, {
      hash: { header: 'HASH', get: x => x.hash },
      sid: { header: 'SID', get: x => x.sid },
      name: { header: 'NAME', get: x => x.name },
    }, { printLine: this.log, ...flags })
    return services
  }
}
