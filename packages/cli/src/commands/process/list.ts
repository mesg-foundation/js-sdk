import cli from 'cli-ux'
import {IProcess} from '@mesg/api/lib/process'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'

export default class ProcessList extends Command {
  static description = 'List processes'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<IProcess[]> {
    const {flags} = this.parse(ProcessList)
    const {processes} = await this.api.process.list({})
    cli.table(processes || [], {
      hash: {header: 'HASH', get: x => x.hash ? base58.encode(x.hash) : ''},
      key: {header: 'KEY', get: x => x.key},
    }, {printLine: this.log, ...flags})
    return processes || []
  }
}
