import {ProcessCreateOutputs} from 'mesg-js/lib/api'
import * as base58 from 'mesg-js/lib/util/base58'

import Command from '../../root-command'

export default class ProcessCreate extends Command {
  static description = 'Create a process'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Process\'s definition. Use process:compile first to build process definition'
  }]

  async run(): ProcessCreateOutputs {
    const {args} = this.parse(ProcessCreate)
    this.spinner.start('Create process')
    const resp = await this.api.process.create(JSON.parse(args.DEFINITION))
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(base58.encode(resp.hash))
    return resp
  }
}
