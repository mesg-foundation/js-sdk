import { Command, flags } from '@oclif/command'
import { join } from 'path'
import Listr from 'listr'
import LCD from '@mesg/api/lib/lcd'
import API from '@mesg/api'
import chalk from 'chalk'
import { decode } from '@mesg/api/lib/util/encoder'
import { parseLog } from '../../utils/docker'
import * as Environment from '../../tasks/environment'
import * as Service from '../../tasks/service'
import * as Runner from '../../tasks/runner'
import * as Instance from '../../tasks/instance'
import version from '../../version'

const ipfsClient = require('ipfs-http-client')

type Context = Environment.IStop | Service.ICompile | Service.ICreate | Runner.ICreate | Runner.ILogs | Instance.IEventLogs | Runner.IResultLogs
type ContextEnd = Runner.ILogsStop | Instance.IEventLogsStop | Runner.IResultLogsStop | Environment.IStop

export default class Dev extends Command {
  static description = 'Run a service in a local development environment'

  static flags = {
    image: flags.string({ name: 'Engine image', default: 'mesg/engine' }),
    tag: flags.string({ name: 'Engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
    configDir: flags.string({ name: 'Configuration directory', default: join(process.cwd(), '.mesg') }),
    configFile: flags.string({ name: 'Config filename', default: 'config.yml' }),
    env: flags.string({
      description: 'Environment variables to inject to the service',
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
    const { args, flags } = this.parse(Dev)

    const tasks = new Listr<Context>([
      Environment.start,
      Service.compile,
      Service.create,
      Runner.create,
      {
        title: 'Start service\'s logs',
        task: () => new Listr<Runner.ILogs | Instance.IEventLogs | Runner.IResultLogs>([
          Runner.logs,
          Instance.eventLogs,
          Runner.resultLogs,
        ])
      }
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

    const runnerLogs = (result as Runner.ILogs).runnerLogs || []
    const eventLogs = (result as Instance.IEventLogs).eventLogs
    const resultLogs = (result as Runner.IResultLogs).resultLogs

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
      await new Listr<ContextEnd>([
        {
          title: 'Stopping logs',
          task: () => new Listr<Runner.ILogsStop | Instance.IEventLogsStop | Runner.IResultLogsStop>([
            Runner.logsStop,
            Instance.eventLogsStop,
            Runner.resultLogsStop
          ])
        },
        Environment.stop,
      ]).run({
        configDir: (result as Environment.ICreateConfig).configDir,
        eventLogs: eventLogs,
        resultLogs: resultLogs,
        runnerLogs: runnerLogs,
      })
    })
  }
}
