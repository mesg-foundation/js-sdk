import {IService} from '@mesg/api/lib/service-lcd'
import {encode} from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import {serviceResolver} from '../../utils/resolver'

export default class ServiceDetail extends Command {
  static description = 'Display detailed information on a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true
  }]

  async run(): Promise<IService> {
    const {args} = this.parse(ServiceDetail)
    const hash = await serviceResolver(this.api, args.SERVICE_HASH)
    const response = await this.lcd.service.get(encode(hash))
    this.styledJSON(response)
    return response
  }
}
