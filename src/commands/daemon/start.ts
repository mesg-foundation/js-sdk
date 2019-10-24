import {flags} from '@oclif/command'
import {homedir} from 'os'
import {join} from 'path'

import Command from '../../docker-command'
import version from '../../version'

import Status, {ServiceStatus} from './status'

export default class Start extends Command {
  static description = 'Start the Engine'

  static flags = {
    ...Command.flags,
    version: flags.string({
      description: 'Version of the Engine to run',
      required: true,
      default: version.engine
    }),
    path: flags.string({
      description: 'Path to the mesg folder',
      default: join(homedir(), '.mesg'),
      required: true,
    }),
    pull: flags.boolean({
      description: 'Pull the latest image of the given version',
      default: true,
      allowNo: true
    }),
    'p2p-port': flags.integer({
      description: 'Port to use for p2p interaction',
      default: 26656,
      required: true,
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const status = await Status.run(['--name', flags.name, '--silent'])
    if (status === ServiceStatus.STARTED) {
      this.log('Engine is already started')
      return false
    }

    if (flags.pull) {
      this.spinner.start(`Pulling version ${flags.version}`)
      await this.pull(flags.version)
      this.spinner.stop()
    }

    this.spinner.start('Starting Engine')
    const eventPromise = this.waitForEvent(({Action, Type, from}) =>
      Type === 'container' &&
      Action === 'start' &&
      from === `mesg/engine:${flags.version}`
    )
    const network = await this.getOrCreateNetwork({name: flags.name})
    await this.createEngineService(network, {
      name: flags.name,
      version: flags.version,
      path: flags.path,
      port: flags.port,
      p2pPort: flags['p2p-port'],
    })
    await eventPromise
    this.spinner.stop()
    return true
  }
}
