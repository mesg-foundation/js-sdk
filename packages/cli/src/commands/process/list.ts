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
    const data = await Promise.all(processes.map(async x => ({
      ...x,
      account: await this.lcd.account.get(x.address),
    })))
    cli.table(data, {
      hash: {header: 'HASH'},
      name: {header: 'NAME'},
      address: {header: 'ADDRESS'},
      balance: {header: 'BALANCE', get: (x) => x.account.coins.map(x => `${x.amount}${x.denom}`).join(', ')}
    }, {printLine: this.log, ...flags})
    return processes
  }
}
