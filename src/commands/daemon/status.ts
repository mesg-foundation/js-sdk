import Command from '../../docker-command'

export const enum ServiceStatus {
  STARTED,
  STOPPED,
}

export default class Status extends Command {
  static description = 'Get the Engine\'s status'

  static flags = {
    ...Command.flags
  }

  async run() {
    const {flags} = this.parse(Status)
    this.spinner.start('MESG Engine')
    this.spinner.status = 'Fetching services'
    const services = await this.listServices({name: flags.name})
    if (services.length === 0) {
      this.spinner.stop('stopped')
      return ServiceStatus.STOPPED
    }
    this.spinner.stop('started')
    return ServiceStatus.STARTED
  }
}
