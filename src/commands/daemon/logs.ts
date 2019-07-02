import { flags } from '@oclif/command'

import Command from '../../docker-command'
import { parseLog } from '../../utils/docker';

export default class Logs extends Command {
  static description = 'Show the Engine\'s logs'

  static flags = {
    ...Command.flags,
    tail: flags.integer({
      description: 'Output specified number of lines at the end of logs',
      default: -1
    }),
    follow: flags.boolean({
      description: 'Follow logs',
      allowNo: true,
      default: true
    })
  }

  async run() {
    const { flags } = this.parse(Logs)
    const services = await this.listServices({
      name: flags.name
    })
    if (services.length === 0) return
    const service = services[0]
    const logs: any = await service.logs({
      stderr: true,
      stdout: true,
      follow: flags.follow,
      tail: flags.tail && flags.tail >= 0 ? flags.tail : 'all'
    })
    logs.on('data', (buffer: Buffer) => parseLog(buffer).forEach(x => this.log(x)))
    logs.on('error', (error: Error) => {
      throw error
    })

    return logs
  }
}
