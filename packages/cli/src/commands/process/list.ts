import cli from 'cli-ux'
import {IProcess} from '@mesg/api/lib/process-lcd'

import Command from '../../root-command'

export default class ProcessList extends Command {
  static description = 'List processes'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<IProcess[]> {
    const {flags} = this.parse(ProcessList)
    const processes = await this.lcd.process.list()
    cli.table(processes, {
      hash: {header: 'HASH'},
      name: {header: 'NAME'},
    }, {printLine: this.log, ...flags})
    return processes
  }
}
