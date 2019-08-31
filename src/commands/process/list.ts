import cli from 'cli-ux'
import {Process} from 'mesg-js/lib/api/types'

import Command from '../../root-command'

export default class ProcessList extends Command {
  static description = 'List processes'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<Process[]> {
    const {flags} = this.parse(ProcessList)
    const {processes} = await this.api.process.list({})
    if (!processes) return []
    cli.table<Process>(processes, {
      hash: {header: 'HASH', get: x => x.hash},
    }, {printLine: this.log, ...flags})
    return processes
  }
}
