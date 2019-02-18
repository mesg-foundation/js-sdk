import cli from 'cli-ux'

import Command from '../../service-command'

export default class ServiceDetail extends Command {
  static description = 'Show details of a deployed service'

  static aliases = ['service:get']

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args} = this.parse(ServiceDetail)
    const service = await this.unaryCall('GetService', {serviceID: args.SERVICE})
    cli.styledJSON(service)
    return service
  }
}
