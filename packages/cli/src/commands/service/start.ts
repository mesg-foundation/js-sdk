import { flags } from '@oclif/command'
import { RunnerCreateOutputs } from '@mesg/api/lib/runner'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import { serviceResolver } from '../../utils/resolver'
import { IRunner } from '@mesg/api/lib/runner-lcd'

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

  async run(): Promise<IRunner> {
    const { args, flags } = this.parse(ServiceStart)
    this.spinner.start('Starting runner')
    const serviceHash = await serviceResolver(this.api, args.SERVICE_HASH)
    const response = await this.api.runner.create({
      serviceHash,
      env: flags.env
    })
    if (!response.hash) throw new Error('invalid runner')
    const hash = base58.encode(response.hash)
    this.spinner.stop(hash)
    const runner = await this.lcd.runner.get(hash)
    this.log(`Runner started with hash ${hash} and instance hash ${runner.instanceHash}`)
    return runner
  }
}
