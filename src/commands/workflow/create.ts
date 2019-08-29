import {WorkflowCreateOutputs} from 'mesg-js/lib/api'
import * as base58 from 'mesg-js/lib/util/base58'

import Command from '../../root-command'

export default class WorkflowCreate extends Command {
  static description = 'Create a workflow'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Workflow\'s definition. Use workflow:compile first to build workflow definition'
  }]

  async run(): WorkflowCreateOutputs {
    const {args} = this.parse(WorkflowCreate)
    this.spinner.start('Create workflow')
    const resp = await this.api.workflow.create(JSON.parse(args.DEFINITION))
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(base58.encode(resp.hash))
    return resp
  }
}
