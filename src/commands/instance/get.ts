import {InstanceGetOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class InstanceGet extends Command {
  static description = 'Show details of an instance'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'HASH',
    required: true,
  }]

  async run(): InstanceGetOutputs {
    const {args} = this.parse(InstanceGet)
    const instance = await this.api.instance.get({hash: args.HASH})
    this.styledJSON(instance)
    return instance
  }
}
