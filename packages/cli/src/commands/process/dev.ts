import { flags, Command } from '@oclif/command'
import Listr from 'listr'
import * as grpc from 'grpc'
import * as Environment from '../../utils/environment-tasks'
import * as Process from '../../utils/process'
import * as Runner from '../../utils/runner'
import version from '../../version'
import Orchestrator from '@mesg/orchestrator'
import * as Execution from '@mesg/orchestrator/lib/typedef/execution'
import { Status } from '@mesg/orchestrator/lib/execution'
import LCDClient from '@mesg/api/lib/lcd'
import * as base58 from '@mesg/api/lib/util/base58'
import chalk from 'chalk'
import { decode } from '@mesg/api/lib/util/encoder'
import { IProcess } from '@mesg/api/lib/process-lcd'
import sign from '../../utils/sign'

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Run a process in a local development environment'

  static flags = {
    version: flags.string({ name: 'Engine version', default: version.engine }),
    pull: flags.boolean({ name: 'Force to pull the docker image', default: false }),
    env: flags.string({
      description: 'Environment variables to inject to the process',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'PROCESS_FILE',
    description: 'Path of a process file'
  }]

  private lcdEndpoint = 'http://localhost:1317'
  private lcd = new LCDClient(this.lcdEndpoint)
  private orchestrator = new Orchestrator('localhost:50052')
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  private logs: grpc.ClientReadableStream<Execution.mesg.types.IExecution>

  async run() {
    const { args, flags } = this.parse(Dev)

    let compilation: Process.CompilationResult
    let deployedProcess: IProcess

    const tasks = new Listr<Environment.IStart>([
      Environment.start,
      {
        title: 'Compiling process',
        task: async ctx => {
          compilation = await Process.compile(args.PROCESS_FILE, this.ipfsClient, this.lcd, this.lcdEndpoint, ctx.config.mnemonic, flags.env)
        }
      },
      {
        title: 'Creating process',
        task: async ctx => {
          deployedProcess = await Process.create(this.lcd, compilation.definition, ctx.config.mnemonic)
        }
      },
      {
        title: 'Fetching process\'s logs',
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
    const { config } = await tasks.run({
      configDir: this.config.dataDir,
      pull: flags.pull,
      version: flags.version,
      endpoint: this.lcdEndpoint,
    })

    this.logs
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
      .on('data', (execution) => {
        if (!execution.processHash) return
        if (!execution.instanceHash) return
        if (base58.encode(execution.processHash) !== deployedProcess.hash) return
        const prefix = `[${execution.nodeKey}] - ${base58.encode(execution.instanceHash)} - ${execution.taskKey}`
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
          title: 'Deleting process',
          task: async () => {
            if (deployedProcess) await Process.remove(this.lcd, deployedProcess, config.mnemonic)
          }
        },
        {
          title: 'Stopping services',
          task: async () => {
            for (const runner of compilation.runners) {
              await Runner.stop(this.lcdEndpoint, config.mnemonic, runner.hash)
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
