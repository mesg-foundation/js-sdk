import { flags, Command } from '@oclif/command'
import Listr from 'listr'
import * as Environment from '../../tasks/environment'
import * as Process from '../../tasks/process'
import * as Execution from '../../tasks/execution'
import version from '../../version'
import API from '@mesg/api'
import LCDClient from '@mesg/api/lib/lcd'
import { join } from 'path'
import * as base58 from '@mesg/api/lib/util/base58'
import chalk from 'chalk'
import { inspect } from 'util'
import { decode } from '@mesg/api/lib/util/encoder'

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Compile a process'

  static flags = {
    image: flags.string({ name: 'MESG engine image', default: 'mesg/engine' }),
    tag: flags.string({ name: 'MESG engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
    configDir: flags.string({ name: 'Directory for your configurations', default: join(process.cwd(), '.mesg') }),
    configFile: flags.string({ name: 'Name of your config file', default: 'config.yml' }),
    env: flags.string({
      description: 'Set environment variables',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'PROCESS_FILE',
    description: 'Path of a process file'
  }]

  async run() {
    const { args, flags } = this.parse(Dev)

    const tasks = new Listr<Environment.IStart | Process.ICompile | Process.ICreate | Execution.ILog>([
      Environment.start,
      Process.compile,
      Process.create,
      Execution.log
    ])
    const result = await tasks.run({
      configDir: flags.configDir,
      configFile: flags.configFile,
      env: flags.env,
      grpc: new API('localhost:50052'),
      image: flags.image,
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
      lcd: new LCDClient('http://localhost:1317'),
      pull: flags.pull,
      tag: flags.tag,
      processFilePath: args.PROCESS_FILE
    })

    const processHash = (result as Process.ICreate).processHash
    const deployedServices = (result as Process.ICompile).deployedServices
    const logs = (result as Execution.ILog).executionStream
    logs
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
      .on('data', (execution) => {
        if (!execution.processHash) return
        if (!execution.instanceHash) return
        if (base58.encode(execution.processHash) !== processHash) return
        const service = deployedServices.find(x => x.runner.instanceHash === base58.encode(execution.instanceHash)).service
        const prefix = `[${execution.nodeKey}] - ${base58.encode(execution.instanceHash)} - ${service.sid} - ${execution.taskKey}`
        if (execution.error) {
          this.log(`${prefix}: ` + chalk.red('ERROR:', execution.error))
        }
        if (!execution.outputs) return
        return this.log(prefix +
          '\n\tinputs:  ' + chalk.gray(inspect(decode(execution.inputs || {}))) +
          '\n\toutputs: ' + chalk.gray(inspect(decode(execution.outputs || {}))) +
          '\n')
      })

    process.once('SIGINT', async () => {
      await new Listr<Execution.ILogsStop | Environment.IStop | Environment.IClearConfig>([
        Execution.logsStop,
        Environment.stop,
        Environment.clearConfig
      ]).run({
        configDir: (result as Environment.ICreateConfig).configDir,
        executionStream: logs
      })
    })
  }
}
