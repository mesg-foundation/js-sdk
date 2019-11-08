import {flags} from '@oclif/command'
import {ServiceCreateOutputs} from '@mesg/api'
import * as base58 from '@mesg/api/lib/util/base58'

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
    const credential = await this.getCredential()
    this.spinner.start('Create service')
    const service = JSON.parse(args.DEFINITION)

    const resp = await this.api.service.create(service, credential)
    if (!resp.hash) throw new Error('invalid hash')
    this.spinner.stop(base58.encode(resp.hash))
    if (flags.start) {
      this.spinner.start('Starting service')
      const start = await ServiceStart.run([base58.encode(resp.hash), ...this.flagsAsArgs(flags)])
      this.spinner.stop(base58.encode(start.hash))
    }
    return {hash: resp.hash}
  }
}
