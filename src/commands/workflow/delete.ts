import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'

export default class WorkflowDelete extends Command {
  static description = 'Delete one or many workflows'

  static flags = {
    ...Command.flags,
    confirm: flags.boolean({description: 'Confirm deletion', default: false})
  }

  static strict = false

  static args = [{
    name: 'WORKFLOW_HASH...',
    required: true,
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(WorkflowDelete)
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Deleting workflow(s)')
    for (const hash of argv) {
      this.spinner.status = hash
      await this.api.workflow.delete({hash})
    }
    this.spinner.stop()
    return argv
  }
}
