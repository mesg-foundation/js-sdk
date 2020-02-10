import {flags} from '@oclif/command'

import Command from '../../docker-command'
import {parseLog} from '../../utils/docker'

export default class Logs extends Command {
  static description = 'Show the Engine\'s logs'

  static flags = {
    ...Command.flags,
    tail: flags.integer({
      description:  'Display the last N lines',
      default: 10000
    }),
    follow: flags.boolean({
      description: 'Follow logs',
      allowNo: true,
      default: true
    })
  }

  async run() {
    const {flags} = this.parse(Logs)
    const logs: any = await this.logs(flags);
    logs.on('data', (buffer: Buffer) => parseLog(buffer).forEach(x => this.log(x)))
    logs.on('error', (error: Error) => {
      throw error
    })
    return logs
  }
}
