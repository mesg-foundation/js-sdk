import cli from 'cli-ux'

import Command, {Service} from '../../service-command'

export default class ServiceDetail extends Command {
  static description = 'Show details of a deployed service'

  static aliases = ['service:get']

  static flags = {
    ...Command.flags,
  }

  static strict = false

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run(): Promise<Service[]> {
    const {argv} = this.parse(ServiceDetail)
    const services: Service[] = []
    for (const arg of argv) {
      const {service} = await this.unaryCall('GetService', {serviceID: arg})
      services.push(service)
    }
    this.styledJSON(services)
    return services
  }
}
