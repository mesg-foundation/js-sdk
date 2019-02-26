import cli from 'cli-ux'

import Command, {Service} from '../../service-command'

export default class ServiceList extends Command {
  static description = 'List all deployed services'

  static aliases = ['service:ls']

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Service[]> {
    const {flags} = this.parse(ServiceList)
    const services = (await this.unaryCall('ListServices')).services as Service[]
    if (!services) return []
    cli.table(services, {
      hash: {header: 'HASH'},
      sid: {header: 'SID'},
      name: {header: 'NAME'},
      status: {header: 'STATUS', get: x => this.status(x.status)}
    }, {
      printLine: this.log,
      ...flags,
    })
    return services
  }
}
