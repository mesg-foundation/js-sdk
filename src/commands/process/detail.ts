import {ProcessGetOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class ProcessDetail extends Command {
  static description = 'Display detailed information on a process'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'PROCESS_HASH',
    required: true
  }]

  async run(): ProcessGetOutputs {
    const {args} = this.parse(ProcessDetail)
    const response = await this.api.process.get({hash: args.PROCESS_HASH})
    this.styledJSON(response)
    return response
  }
}
