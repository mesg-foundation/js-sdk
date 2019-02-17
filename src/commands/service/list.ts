import cli from 'cli-ux'

import Command, {Service} from '../../service-command'

export default class ServiceList extends Command {
  static description = 'List all deployed services'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(ServiceList)
    this.mesg.api.ListServices({}, (error: Error, response: any) => {
      if (error) return this.error(error)
      const services = response.services as Service[]
      if (!services) return
      cli.table(services, {
        hash: {header: 'HASH'},
        sid: {header: 'SID'},
        name: {header: 'NAME'},
        status: {header: 'STATUS', get: x => this.status(x.status)}
      }, {
        printLine: this.log,
        ...flags,
      })
    })
  }
}
