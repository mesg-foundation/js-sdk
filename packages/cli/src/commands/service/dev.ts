import { Command, flags } from '@oclif/command'
import { join } from 'path'
import Listr from 'listr'
import LCD from '@mesg/api/lib/lcd'
import API from '@mesg/api'
import chalk from 'chalk'
import { decode } from '@mesg/api/lib/util/encoder'
import { parseLog } from '../../utils/docker'
import * as Tasks from '../../tasks'
import version from '../../version'

const ipfsClient = require('ipfs-http-client')

type Context = Tasks.IStartEnvironment | Tasks.ICompileService | Tasks.ICreateService | Tasks.IStartService | Tasks.IServiceLogs

export default class Service extends Command {
  static description = 'Run a service in a local development environment'

  static flags = {
    image: flags.string({ name: 'MESG engine image', default: 'mesg/engine' }),
    tag: flags.string({ name: 'MESG engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
    configDir: flags.string({ name: 'Directory for your configurations', default: join(process.cwd(), '.mesg') }),
    configFile: flags.string({ name: 'Name of your config file', default: 'config.yml' }),
    env: flags.string({
      description: 'Set environment variables to start the service',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'PATH',
    description: 'Path or url of a service',
    default: './'
  }]

  async run() {
    const { args, flags } = this.parse(Service)

    const tasks = new Listr<Context>([
      Tasks.startEnvironment,
      Tasks.compileService,
      Tasks.createService,
      Tasks.startService,
      Tasks.serviceLogs,
    ])
    const result = await tasks.run({
      configDir: flags.configDir,
      configFile: flags.configFile,
      env: flags.env,
      image: flags.image,
      pull: flags.pull,
      tag: flags.tag,
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
      path: args.PATH,
      grpc: new API('localhost:50052'),
      lcd: new LCD('http://localhost:1317'),
    })

    const runnerLogs = (result as Tasks.IRunnerLogs).runnerLogs || []
    const eventLogs = (result as Tasks.IInstanceEventLogs).eventLogs
    const resultLogs = (result as Tasks.IRunnerResultLogs).resultLogs

    for (const log of runnerLogs) {
      log
        .on('data', buffer => parseLog(buffer).forEach(x => this.log(chalk.gray(x))))
        .on('error', error => { this.warn('Docker log stream error: ' + error.message) })
    }

    eventLogs
      .on('data', event => this.log(`EVENT[${event.key}]: ` + chalk.gray(JSON.stringify(decode(event.data)))))
      .on('error', error => { this.warn('Event stream error: ' + error.message) })

    resultLogs
      .on('data', execution => execution.error
        ? this.log(`RESULT[${execution.taskKey}]: ` + chalk.red('ERROR:', execution.error))
        : this.log(`RESULT[${execution.taskKey}]: ` + chalk.gray(JSON.stringify(decode(execution.outputs)))))
      .on('error', error => { this.warn('Result stream error: ' + error.message) })

    process.once('SIGINT', async () => {
      await new Listr<Tasks.IServiceLogsStop | Tasks.IStopEnvironment | Tasks.IClearConfig>([
        Tasks.serviceLogsStop,
        Tasks.stopEnvironment,
        Tasks.clearConfig
      ]).run({
        configDir: (result as Tasks.ICreateConfig).configDir,
        eventLogs: eventLogs,
        resultLogs: resultLogs,
        runnerLogs: runnerLogs,
      })
    })
  }
}
