import {IProcess} from '@mesg/api/lib/process-lcd'

import Command from '../../root-command'

export default class ProcessDetail extends Command {
  static description = 'Display detailed information on a process'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'PROCESS_HASH',
    required: true
  }]

  async run(): Promise<IProcess> {
    const {args} = this.parse(ProcessDetail)
    const response = await this.lcd.process.get(args.PROCESS_HASH)
    this.styledJSON(response)
    return response
  }
}
