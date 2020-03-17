import { IProcess } from '@mesg/api/lib/process'
import { hash } from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import { IsAlreadyExistsError } from '../../utils/error'

import ProcessCompile from './compile'
import ProcessCreate from './create'
import ProcessDelete from './delete'
import ProcessLog from './logs'
import { cli } from 'cli-ux'

export default class ProcessDev extends Command {
  static description = 'Run a process in development mode'

  static flags = {
    ...Command.flags,
    ...ProcessCompile.flags,
    ...ProcessCreate.flags,
  }

  static args = [{
    name: 'PROCESS',
    description: 'Path of the process',
    default: './'
  }]

  processCreated = false
  instanceCreated = false

  async run() {
    const { args, flags } = this.parse(ProcessDev)

    cli.action.start('Starting process')
    cli.action.status = 'compiling'
    const envToArgs = (flags.env || []).reduce((prev: string[], next: string) => [...prev, '--env', next], [])
    const definition = await ProcessCompile.run([args.PROCESS, '--dev', ...envToArgs, ...this.flagsAsArgs(flags)])
    cli.action.status = 'creating process'
    const processHash = await this.createProcess(definition)
    cli.action.status = 'fetching logs'
    const stream = await ProcessLog.run([base58.encode(processHash), ...this.flagsAsArgs(flags)])
    cli.action.stop('ready')

    process.once('SIGINT', async () => {
      stream.destroy()
      if (this.processCreated) await ProcessDelete.run([base58.encode(processHash), '--confirm', ...this.flagsAsArgs(flags)])
    })
  }

  async createProcess(definition: IProcess): Promise<hash> {
    try {
      const process = await this.api.process.create(definition)
      if (!process.hash) throw new Error('invalid hash')
      this.processCreated = true
      return process.hash
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      this.warn('process already created')
      return new IsAlreadyExistsError(e).hash
    }
  }
}
