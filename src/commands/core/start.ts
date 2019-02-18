import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../docker-command'

import Status, {ServiceStatus} from './status'

export default class Start extends Command {
  static description = 'Start the Core'

  static flags = {
    ...Command.flags,
    version: flags.string({
      description: 'Version of the core to run',
      required: true,
      default: 'latest'
    }),
    'log-force-colors': flags.boolean({
      description: 'log force colors',
      default: false
    }),
    'log-format': flags.enum({
      description: 'log format',
      default: 'text',
      options: ['text', 'json']
    }),
    'log-level': flags.enum({
      description: 'log level',
      default: 'info',
      options: ['debug', 'info', 'warn', 'error', 'fatal', 'panic']
    }),
  }

  async run() {
    const {flags} = this.parse(Start)

    const status = await Status.run(['--name', flags.name])
    if (status === ServiceStatus.STARTED) {
      return false
    }
    cli.action.start('MESG Core')
    const eventPromise = this.waitForEvent(({Action, Type, from}) =>
      Type === 'container' &&
      Action === 'start' &&
      from === `mesg/core:${flags.version}`
    )
    cli.action.status = 'Creating network'
    const network = await this.getOrCreateNetwork({name: flags.name})
    cli.action.status = 'Creating service'
    await this.createService(network, {
      name: flags.name,
      version: flags.version,
      colors: flags['log-force-colors'],
      format: flags['log-format'],
      level: flags['log-level']
    })
    cli.action.status = 'Waiting service to start'
    await eventPromise
    cli.action.stop('Started')

    return true
  }
}
