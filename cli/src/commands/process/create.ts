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
    const definition = JSON.parse(args.DEFINITION, function (this: any, key: string, value: any): any {
      return key && key.match(/hash$/i) && value && typeof value === 'string'
        ? base58.decode(value)
        : value
    })
    const resp = await this.api.process.create(definition)
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(base58.encode(resp.hash))
    return resp
  }
}
