import { Command, flags } from '@oclif/command'
import { readdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import LCD from '@mesg/api'
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
import { IDefinition as IServiceDefinition } from '@mesg/api/lib/service'
import { IDefinition as IProcessDefinition } from '@mesg/api/lib/process'
import chalk from 'chalk'
import { decode } from '@mesg/orchestrator/lib/encoder'
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
  private orchestratorEndpoint = 'localhost:50052'
  private lcd = new LCD(this.lcdEndpoint)
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })
  private orchestrator = new Orchestrator(this.orchestratorEndpoint)
  private logs: grpc.ClientReadableStream<Execution.mesg.types.IExecution>
  private processesToDeploy: { [key: string]: IProcessDefinition } = {}
  private servicesToDeploy: { [key: string]: IServiceDefinition } = {}
  private runnersToDeploy: { [key: string]: { serviceHash: string, env: string[] } } = {}

  async run() {
    const { args, flags } = this.parse(Dev)

    if (!existsSync(join(args.PATH, 'services'))) this.error(`${args.PATH} is not a recognized as a MESG project`)

    const envs = existsSync(join(args.PATH, '.env'))
      ? dotenv.parse(readFileSync(join(args.PATH, '.env')))
      : {}
    const env = Object.keys(envs).reduce((prev, x) => [...prev, `${x}=${envs[x]}`], [])

    const tasks = new Listr([
      Environment.start,
      {
        title: 'Compiling processes',
        task: async () => {
          const processFiles = readdirSync(args.PATH, { withFileTypes: true })
            .filter(x => x.isFile() && x.name.match(/\.(yml|yaml)/))
          return new Listr(processFiles.map(file => ({
            title: file.name,
            task: async (ctx, task) => {
              const compilation = await Process.compile(
                join(args.PATH, file.name),
                env,
                async ({ src, env }) => {
                  task.output = `compiling ${src}`
                  const definition = await Service.compile(src, this.ipfsClient)
                  const serviceHash = await this.lcd.service.hash(definition)
                  const runner = await this.lcd.runner.hash(ctx.engineAddress, serviceHash, env)
                  this.servicesToDeploy[serviceHash] = definition
                  this.runnersToDeploy[runner.runnerHash] = { serviceHash, env }
                  return {
                    hash: runner.runnerHash,
                    instanceHash: runner.instanceHash
                  }
                }
              )
              const hash = await this.lcd.process.hash(compilation.definition)
              this.processesToDeploy[hash] = compilation.definition
            }
          })))
        }
      },
      {
        title: 'Creating services',
        task: () => new Listr(Object.keys(this.servicesToDeploy).map(hash => ({
          title: this.servicesToDeploy[hash].name,
          skip: () => this.lcd.service.exists(hash),
          task: async ctx => await Service.create(this.lcd, this.servicesToDeploy[hash], ctx.config.mnemonic)
        })))
      },
      {
        title: 'Starting services',
        task: () => new Listr(Object.keys(this.runnersToDeploy).map(hash => ({
          title: hash,
          skip: () => this.lcd.runner.exists(hash),
          task: async ctx => await Runner.create(this.lcd, this.lcdEndpoint, this.orchestratorEndpoint, ctx.config.mnemonic, ctx.engineAddress, this.runnersToDeploy[hash].serviceHash, this.runnersToDeploy[hash].env)
        })))
      },
      {
        title: 'Creating processes',
        task: () => new Listr(Object.keys(this.processesToDeploy).map(hash => ({
          title: this.processesToDeploy[hash].name,
          skip: () => this.lcd.process.exists(hash),
          task: async ctx => await Process.create(this.lcd, this.processesToDeploy[hash], ctx.config.mnemonic)
        })))
      },
      {
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
      }
    ])

    const { config, engineAddress } = await tasks.run({
      configDir: this.config.dataDir,
      endpoint: this.lcdEndpoint,
      pull: flags.pull,
      version: flags.version
    })

    this.logs
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
      .on('data', (execution) => {
        if (!execution.processHash) return
        const process = this.processesToDeploy[base58.encode(execution.processHash)]
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
          task: async () => new Listr(Object.keys(this.runnersToDeploy).map(hash => ({
            title: hash,
            task: async () => Runner.stop(this.lcdEndpoint, this.orchestratorEndpoint, config.mnemonic, engineAddress, hash)
          })))
        },
        {
          title: 'Deleting processes',
          task: async () => new Listr(Object.keys(this.processesToDeploy).map(hash => ({
            title: this.processesToDeploy[hash].name,
            task: async () => await Process.remove(this.lcd, hash, config.mnemonic)
          })))
        },
        Environment.stop
      ]).run({
        configDir: this.config.dataDir
      })
    })
  }
}
