import cli from 'cli-ux'

import Command from '../../docker-command'

export const enum ServiceStatus {
  STARTED,
  STOPPED,
}

export default class Status extends Command {
  static description = 'Get the Core\'s status'

  static flags = {
    ...Command.flags
  }

  async run() {
    const {flags} = this.parse(Status)
    cli.action.start('MESG Core')
    cli.action.status = 'Fetching services'
    const services = await this.listServices({name: flags.name})
    if (services.length === 0) {
      cli.action.stop('stopped')
      return ServiceStatus.STOPPED
    }
    cli.action.stop('started')
    return ServiceStatus.STARTED
  }
}
