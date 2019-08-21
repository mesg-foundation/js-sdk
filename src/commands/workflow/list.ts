import cli from 'cli-ux'
import {Workflow} from 'mesg-js/lib/api/types'

import Command from '../../root-command'

export default class WorkflowList extends Command {
  static description = 'List workflows'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Workflow[]> {
    const {flags} = this.parse(WorkflowList)
    const {workflows} = await this.api.workflow.list({})
    if (!workflows) return []
    cli.table<Workflow>(workflows, {
      hash: {header: 'HASH', get: x => x.hash},
    }, {printLine: this.log, ...flags})
    return workflows
  }
}
