import {flags} from '@oclif/command'

import Command from '../../docker-command'

export default class Logs extends Command {
  static description = 'Show the Core\'s logs'

  static flags = {
    ...Command.flags,
    tail: flags.integer({
      description: 'Output specified number of lines at the end of logs',
      default: -1
    })
  }

  async run() {
    const {flags} = this.parse(Logs)
    const services = await this.listServices({
      name: flags.name
    })
    if (services.length === 0) return
    const service = services[0]
    const logs: any = await service.logs({
      stderr: true,
      stdout: true,
      follow: true,
      tail: flags.tail && flags.tail >= 0 ? flags.tail : 'all'
    })
    logs.on('data', (buffer: Buffer) => this.log(this.parseLog(buffer)))
    logs.on('error', (error: Error) => { throw error })
  }
}
