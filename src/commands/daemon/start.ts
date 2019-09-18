import {flags} from '@oclif/command'

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
    'log-force-colors': flags.boolean({
      description: 'Log force colors',
      default: false
    }),
    'log-format': flags.enum({
      description: 'Log format',
      default: 'text',
      options: ['text', 'json']
    }),
    'log-level': flags.enum({
      description: 'Log level',
      default: 'info',
      options: ['debug', 'info', 'warn', 'error', 'fatal', 'panic']
    }),
    pull: flags.boolean({
      description: 'Pull the latest image of the given version',
      default: true,
      allowNo: true
    })
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
    await this.createService(network, {
      name: flags.name,
      version: flags.version,
      colors: flags['log-force-colors'],
      format: flags['log-format'],
      level: flags['log-level']
    })
    await eventPromise
    this.spinner.stop()
    return true
  }
}
