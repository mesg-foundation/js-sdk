import {flags} from '@oclif/command'
import {ServiceCreateOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

import ServiceStart from './start'

export default class ServiceCreate extends Command {
  static description = 'Create a service'

  static flags = {
    ...Command.flags,
    start: flags.boolean({
      description: 'Automatically start the service once created',
      default: false,
    })
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Service\'s definition. Use service:compile first to build service definition'
  }]

  async run(): ServiceCreateOutputs {
    const {args, flags} = this.parse(ServiceCreate)
    this.spinner.start('Create service')
    const resp = await this.api.service.create(JSON.parse(args.DEFINITION))
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(resp.hash)
    if (flags.start) {
      this.spinner.start('Create service')
      const start = await ServiceStart.run([resp.hash])
      this.spinner.stop(start.hash)
    }
    return resp
  }
}
