import {flags} from '@oclif/command'
import {ServiceCreateOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'
import {isAlreadyExists, resourceHash} from '../../utils/error'

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
    let resp: any
    try {
      resp = await this.api.service.create(JSON.parse(args.DEFINITION))
    } catch (e) {
      resp = this.handleError(e)
    }
    if (!resp.hash) { throw new Error('invalid response') }
    this.spinner.stop(resp.hash)
    if (flags.start) {
      this.spinner.start('Starting service')
      const start = await ServiceStart.run([resp.hash])
      this.spinner.stop(start.hash)
    }
    return resp
  }

  handleError(err: Error) {
    if (isAlreadyExists(err, 'service')) {
      const hash = resourceHash(err, 'service')
      this.warn(`service ${hash} already created`)
      this.spinner.stop(hash)
      return {hash}
    }
    throw err
  }
}
