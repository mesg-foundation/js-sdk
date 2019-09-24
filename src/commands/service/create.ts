import {flags} from '@oclif/command'
import {ServiceCreateOutputs} from 'mesg-js/lib/api'
import * as base58 from 'mesg-js/lib/util/base58'

import {WithCredential as Command} from '../../credential-command'

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
    const resp = await this.api.service.create(JSON.parse(args.DEFINITION), await this.getCredential())
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(base58.encode(resp.hash))
    if (flags.start) {
      this.spinner.start('Starting service')
      const start = await ServiceStart.run([base58.encode(resp.hash)])
      this.spinner.stop(start.hash)
    }
    return resp
  }
}
