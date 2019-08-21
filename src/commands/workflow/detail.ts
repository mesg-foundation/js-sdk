import {WorkflowGetOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

export default class WorkflowDetail extends Command {
  static description = 'Display detailed information on a workflow'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'WORKFLOW_HASH',
    required: true
  }]

  async run(): WorkflowGetOutputs {
    const {args} = this.parse(WorkflowDetail)
    const response = await this.api.workflow.get({hash: args.WORKFLOW_HASH})
    this.styledJSON(response)
    return response
  }
}
