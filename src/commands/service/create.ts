import { ServiceCreateOutputs } from 'mesg-js/lib/api';
import Command from '../../root-command'

export default class ServiceCreate extends Command {
  static description = 'Create a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Service\'s definition. Use service:compile first to build service definition'
  }]

  async run(): ServiceCreateOutputs {
    const { args } = this.parse(ServiceCreate)
    this.spinner.start('Create service')
    const resp = await this.api.service.create(JSON.parse(args.DEFINITION))
    this.spinner.stop(resp.hash)
    return resp
  }
}
