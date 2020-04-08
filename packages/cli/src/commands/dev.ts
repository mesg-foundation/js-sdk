import { Command, flags } from '@oclif/command'
import { readdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import LCD from '@mesg/api/lib/lcd'
import Orchestrator from '@mesg/orchestrator'
import Execution from '@mesg/orchestrator/lib/typedef/execution'
import { Status } from '@mesg/orchestrator/lib/execution'
import * as grpc from 'grpc'
import Listr from 'listr'
import dotenv from 'dotenv'
import * as Environment from '../utils/environment-tasks'
import * as Service from '../utils/service'
import * as Runner from '../utils/runner'
import * as Process from '../utils/process'
import * as base58 from '@mesg/api/lib/util/base58'
import version from '../version'
import { IService } from '@mesg/api/lib/service-lcd'
import { IProcess } from '@mesg/api/lib/process-lcd'
import chalk from 'chalk'
import { decode } from '@mesg/api/lib/util/encoder'
import { RunnerInfo } from '@mesg/runner'
import sign from '../utils/sign'

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Start a dev environment for your project'

  static flags = {
    version: flags.string({ name: 'Engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
  }

  static args = [{
    name: 'PATH',
    description: 'Path of your project',
    default: './'
  }]

  private lcdEndpoint = 'http://localhost:1317'
  private lcd = new LCD(this.lcdEndpoint)
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })
  private orchestrator = new Orchestrator('localhost:50052')
  private logs: grpc.ClientReadableStream<Execution.mesg.types.IExecution>
  private services: IService[] = []
  private processes: IProcess[] = []
  private runners: RunnerInfo[] = []

  async run() {
    const { args, flags } = this.parse(Dev)

    if (!existsSync(join(args.PATH, 'services'))) this.error(`${args.PATH} is not a recognized as a MESG project`)

    const envs = existsSync(join(args.PATH, '.env'))
      ? dotenv.parse(readFileSync(join(args.PATH, '.env')))
      : {}
    const env = Object.keys(envs).reduce((prev, x) => [...prev, `${x}=${envs[x]}`], [])

    const tasks = new Listr([
      Environment.start
    ])

    const serviceDirs = readdirSync(join(args.PATH, 'services'), { withFileTypes: true })
      .filter(x => x.isDirectory() || x.isSymbolicLink())
    for (const dir of serviceDirs) {
      tasks.add([
        {
          title: `Creating service "${dir.name}"`,
          task: async (ctx) => {
            const definition = await Service.compile(join(args.PATH, 'services', dir.name), this.ipfsClient)
            const service = await Service.create(this.lcd, definition, ctx.config.mnemonic)
            this.services.push(service)
          }
        }
      ])
    }

    const processFiles = readdirSync(args.PATH, { withFileTypes: true })
      .filter(x => x.isFile() && x.name.match(/\.(yml|yaml)/))

    for (const file of processFiles) {
      tasks.add({
        title: `Creating process "${file.name}"`,
        task: async (ctx) => {
          const compilation = await Process.compile(join(args.PATH, file.name), this.ipfsClient, this.lcd, this.lcdEndpoint, ctx.config.mnemonic, env)
          const deployedProcess = await Process.create(this.lcd, compilation.definition, ctx.config.mnemonic)
          this.processes.push(deployedProcess)
          this.runners = [
            ...this.runners,
            ...compilation.runners,
          ].filter((item, i, self) => i === self.indexOf(item))
        }
      })
    }

    tasks.add({
      title: 'Fetching logs',
      task: ctx => {
        const payload = {
          filter: {
            statuses: [
              Status.Completed,
              Status.Failed
            ]
          }
        }
        this.logs = this.orchestrator.execution.stream(payload, sign(payload, ctx.config.mnemonic))
      }
    })

    const { config } = await tasks.run({
      configDir: this.config.dataDir,
      endpoint: this.lcdEndpoint,
      pull: flags.pull,
      version: flags.version
    })

    this.logs
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
      .on('data', (execution) => {
        if (!execution.processHash) return
        const process = this.processes.find(x => x.hash === base58.encode(execution.processHash))
        if (!process) return

        const prefix = `[${process.name}][${execution.nodeKey}] - ${base58.encode(execution.instanceHash)} - ${execution.taskKey}`
        if (execution.error) {
          this.log(`${prefix}: ` + chalk.red('ERROR:', execution.error))
        }
        if (!execution.outputs) return
        return this.log(prefix +
          '\n\tinputs:  ' + chalk.gray(JSON.stringify(decode(execution.inputs || {}))) +
          '\n\toutputs: ' + chalk.gray(JSON.stringify(decode(execution.outputs || {}))) +
          '\n')
      })

    process.once('SIGINT', async () => {
      await new Listr<Environment.IStop>([
        {
          title: 'Stopping logs',
          task: () => {
            if (this.logs) this.logs.cancel()
          }
        },
        {
          title: 'Stopping running services',
          task: async () => {
            const uniqueRunners = this.runners.filter((item, i, self) => i === self.indexOf(item))
            for (const runner of uniqueRunners) {
              await Runner.stop(this.lcdEndpoint, config.mnemonic, runner.hash)
            }
          }
        },
        {
          title: 'Deleting processes',
          task: async () => {
            for (const process of this.processes) {
              await Process.remove(this.lcd, process, config.mnemonic)
            }
          }
        },
        Environment.stop
      ]).run({
        configDir: this.config.dataDir
      })
    })
  }
}
