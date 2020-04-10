import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import LCD from '@mesg/api'
import Orchestrator from '@mesg/orchestrator'
import Event from '@mesg/orchestrator/lib/typedef/event'
import Execution from '@mesg/orchestrator/lib/typedef/execution'
import * as grpc from 'grpc'
import chalk from 'chalk'
import { decode } from '@mesg/orchestrator/lib/encoder'
import { parseLog, listContainers } from '../../utils/docker'
import * as Environment from '../../utils/environment-tasks'
import * as Service from '../../utils/service'
import * as Runner from '../../utils/runner'
import { Status } from "@mesg/orchestrator/lib/execution";
import version from '../../version'
import { IService, IDefinition } from '@mesg/api/lib/service'
import { Stream } from 'stream'
import { RunnerInfo } from '@mesg/runner'
import sign from '../../utils/sign'

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Run a service in a local development environment'

  static flags = {
    version: flags.string({ name: 'Engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
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

  private lcdEndpoint = 'http://localhost:1317'
  private orchestratorEndpoint = 'localhost:50052'
  private lcd = new LCD(this.lcdEndpoint)
  private orchestrator = new Orchestrator(this.orchestratorEndpoint)
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  private logs: Stream[]
  private events: grpc.ClientReadableStream<Event.mesg.types.IEvent>
  private results: grpc.ClientReadableStream<Execution.mesg.types.IExecution>

  async run() {
    const { args, flags } = this.parse(Dev)

    let definition: IDefinition
    let service: IService
    let runner: RunnerInfo

    const tasks = new Listr<Environment.IStart>([
      Environment.start,
      {
        title: 'Compiling service',
        task: async () => {
          definition = await Service.compile(args.PATH, this.ipfsClient)
        }
      },
      {
        title: 'Creating service',
        task: async ctx => {
          service = await Service.create(this.lcd, definition, ctx.config.mnemonic)
        }
      },
      {
        title: 'Starting service',
        task: async ctx => {
          runner = await Runner.create(this.lcdEndpoint, this.orchestratorEndpoint, ctx.config.mnemonic, ctx.engineAddress, service.hash, flags.env)
        }
      },
      {
        title: 'Fetching service\'s logs',
        task: () => new Listr([
          {
            title: 'Fetching service\'s logs',
            task: async () => {
              const dockerContainers = await listContainers({ label: [`mesg.runner=${runner.hash}`] })
              this.logs = await Promise.all(dockerContainers.map(x => x.logs({
                stderr: true,
                stdout: true,
                follow: true,
                tail: 'all',
              }) as unknown as Promise<Stream>))
            }
          },
          {
            title: 'Fetching events\' logs',
            task: ctx => {
              const payload = {
                filter: {
                  instanceHash: runner.instanceHash
                }
              }
              this.events = this.orchestrator.event.stream(payload, sign(payload, ctx.config.mnemonic))
            }
          },
          {
            title: 'Fetching executions\' logs',
            task: async ctx => {
              const payload = {
                filter: {
                  executorHash: runner.hash,
                  statuses: [
                    Status.Completed,
                    Status.Failed,
                  ]
                }
              }
              this.results = this.orchestrator.execution.stream(payload, sign(payload, ctx.config.mnemonic))
            }
          }
        ])
      }
    ])
    const { config, engineAddress } = await tasks.run({
      configDir: this.config.dataDir,
      pull: flags.pull,
      version: flags.version,
      endpoint: this.lcdEndpoint,
    })

    for (const log of this.logs) {
      log
        .on('data', buffer => parseLog(buffer).forEach(x => this.log(chalk.gray(x))))
        .on('error', error => { this.warn('Docker log stream error: ' + error.message) })
    }

    this.events
      .on('data', event => this.log(`EVENT[${event.key}]: ` + chalk.gray(JSON.stringify(decode(event.data)))))
      .on('error', error => { this.warn('Event stream error: ' + error.message) })

    this.results
      .on('data', execution => execution.error
        ? this.log(`RESULT[${execution.taskKey}]: ` + chalk.red('ERROR:', execution.error))
        : this.log(`RESULT[${execution.taskKey}]: ` + chalk.gray(JSON.stringify(decode(execution.outputs)))))
      .on('error', error => { this.warn('Result stream error: ' + error.message) })

    process.once('SIGINT', async () => {
      await new Listr<Environment.IStop>([
        {
          title: 'Stopping logs',
          task: async () => {
            if (this.logs) this.logs.forEach((x: any) => x.destroy())
            if (this.events) this.events.cancel()
            if (this.results) this.results.cancel()
            return Promise.resolve()
          }
        },
        {
          title: 'Stopping service',
          skip: () => !service && !runner,
          task: async () => {
            return Runner.stop(this.lcdEndpoint, this.orchestratorEndpoint, config.mnemonic, engineAddress, runner.hash)
          }
        },
        Environment.stop,
      ]).run({
        configDir: this.config.dataDir
      })
    })
  }
}
