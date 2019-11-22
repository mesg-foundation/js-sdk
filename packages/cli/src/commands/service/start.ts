import {flags} from '@oclif/command'
import {RunnerCreateOutputs} from '@mesg/api/lib/runner'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import {serviceResolver} from '../../utils/resolver'

export default class ServiceStart extends Command {
  static description = 'Start a service by creating a new runner'

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

  async run(): RunnerCreateOutputs {
    const {args, flags} = this.parse(ServiceStart)
    this.spinner.start('Starting runner')
    const serviceHash = await serviceResolver(this.api, args.SERVICE_HASH)
    const {hash} = await this.api.runner.create({
      serviceHash,
      env: flags.env
    })
    if (!hash) throw new Error('invalid runner')
    this.spinner.stop(base58.encode(hash))
    const runner = await this.api.runner.get({hash})
    this.log(`Runner started with hash ${base58.encode(hash)} and instance hash ${base58.encode(runner.instanceHash)}`)
    return {hash}
  }
}
