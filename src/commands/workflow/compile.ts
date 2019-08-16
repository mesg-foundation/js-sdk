import {readFileSync} from 'fs'

import Command from '../../root-command'
import * as compile from '../../utils/compiler'

export default class WorkflowCompile extends Command {
  static description = 'Compile a workflow'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'WORKFLOW_FILE',
    description: 'Path of a workflow file'
  }]

  async run(): Promise<any> {
    const {args} = this.parse(WorkflowCompile)
    const definition = await compile.workflow(readFileSync(args.WORKFLOW_FILE))
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }
}
