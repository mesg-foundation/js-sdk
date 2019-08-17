import {flags} from '@oclif/command'
import {InstanceCreateOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'
import {isAlreadyExists, resourceHash} from '../../utils/error'
import serviceResolver from '../../utils/service-resolver'

export default class ServiceStart extends Command {
  static description = 'Start a service by creating a new instance'

  static flags = {
    ...Command.flags,
    env: flags.string({
      description: 'Set environment variables',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_HASH',
    required: true,
  }]

  async run(): InstanceCreateOutputs {
    const {args, flags} = this.parse(ServiceStart)
    this.spinner.start('Start instance')
    const serviceHash = await serviceResolver(this.api, args.SERVICE_HASH)
    try {
      const instance = await this.api.instance.create({
        serviceHash,
        env: flags.env
      })
      if (!instance.hash) throw new Error('invalid instance')
      this.spinner.stop(instance.hash)
      return instance
    } catch (err) {
      return this.handleError(err)
    }
  }

  handleError(err: Error) {
    if (isAlreadyExists(err, 'instance')) {
      const hash = resourceHash(err, 'instance')
      this.warn(`instance ${hash} already started`)
      this.spinner.stop(hash)
      return {hash}
    }
    throw err
  }
}
