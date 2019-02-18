import cli from 'cli-ux'

import Command from '../../docker-command'

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
    return cli.action.stop(services.length === 0 ? 'stopped' : 'started')
  }
}
