import {ServiceGetOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class ServiceDetail extends Command {
  static description = 'Show details of a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true
  }]

  async run(): ServiceGetOutputs {
    const {args} = this.parse(ServiceDetail)
    const response = await this.api.service.get({hash: args.SERVICE_HASH})
    this.styledJSON(response)
    return response
  }
}
