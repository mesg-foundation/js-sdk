import { Command, flags } from '@oclif/command'
import { join } from 'path'
import Listr from 'listr'
import LCD from '@mesg/api/lib/lcd'
import API from '@mesg/api'
import chalk from 'chalk'
import { decode } from '@mesg/api/lib/util/encoder'
import { parseLog, listContainers } from '../../utils/docker'
import * as Environment from '../../utils/environment-tasks'
import * as Service from '../../utils/service'
import * as Runner from '../../utils/runner'
import * as base58 from "@mesg/api/lib/util/base58";
import { ExecutionStatus } from "@mesg/api/lib/types";
import version from '../../version'
import { IService } from '@mesg/api/lib/service-lcd'
import { IRunner } from '@mesg/api/lib/runner-lcd'
import { Stream } from 'stream'
import { IEvent } from "@mesg/api/lib/event";
import { IExecution } from "@mesg/api/lib/execution";
import { Stream as GRPCStream } from "@mesg/api/lib/util/grpc";

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Run a service in a local development environment'

  static flags = {
    image: flags.string({ name: 'Engine image', default: 'mesg/engine' }),
    tag: flags.string({ name: 'Engine version', default: version.engine }),
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
  private lcd = new LCD(this.lcdEndpoint)
  private grpc = new API('localhost:50052')
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  private logs: Stream[]
  private events: GRPCStream<IEvent>
  private results: GRPCStream<IExecution>

  async run() {
    const { args, flags } = this.parse(Dev)

    let definition: IService
    let service: IService
    let runner: IRunner

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
          service = await Service.create(this.lcd, definition, ctx.mnemonic)
        }
      },
      {
        title: 'Starting service',
        task: async ctx => {
          runner = await Runner.create(this.lcdEndpoint, ctx.mnemonic, service.hash, flags.env)
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
            task: () => {
              this.events = this.grpc.event.stream({
                filter: {
                  instanceHash: base58.decode(runner.instanceHash)
                }
              })
            }
          },
          {
            title: 'Fetching executions\' logs',
            task: async () => {
              this.results = this.grpc.execution.stream({
                filter: {
                  executorHash: base58.decode(runner.hash),
                  statuses: [
                    ExecutionStatus.COMPLETED,
                    ExecutionStatus.FAILED,
                  ]
                }
              })
            }
          }
        ])
      }
    ])
    await tasks.run({
      configDir: this.config.dataDir,
      image: flags.image,
      pull: flags.pull,
      tag: flags.tag,
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
        Environment.stop,
      ]).run({
        configDir: this.config.dataDir
      })
    })
  }
}
