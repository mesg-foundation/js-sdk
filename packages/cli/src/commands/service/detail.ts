import {ServiceGetOutputs} from '@mesg/api/lib/service'

import Command from '../../root-command'
import serviceResolver from '../../utils/service-resolver'

export default class ServiceDetail extends Command {
  static description = 'Display detailed information on a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true
  }]

  async run(): ServiceGetOutputs {
    const {args} = this.parse(ServiceDetail)
    const hash = await serviceResolver(this.api, args.SERVICE_HASH)
    const response = await this.api.service.get({hash})
    this.styledJSON(response)
    return response
  }
}
