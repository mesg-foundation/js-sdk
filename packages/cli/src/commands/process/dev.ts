import { flags, Command } from '@oclif/command'
import Listr from 'listr'
import * as Environment from '../../utils/environment-tasks'
import * as Process from '../../utils/process'
import version from '../../version'
import API from '@mesg/api'
import LCDClient from '@mesg/api/lib/lcd'
import { join } from 'path'
import * as base58 from '@mesg/api/lib/util/base58'
import chalk from 'chalk'
import { inspect } from 'util'
import { decode } from '@mesg/api/lib/util/encoder'
import { IProcess } from '@mesg/api/lib/process-lcd'
import { IExecution } from "@mesg/api/lib/execution";
import { Stream as GRPCStream } from "@mesg/api/lib/util/grpc";
import { ExecutionStatus } from '@mesg/api/lib/types'

const ipfsClient = require('ipfs-http-client')

export default class Dev extends Command {
  static description = 'Run a process in a local development environment'

  static flags = {
    image: flags.string({ name: 'Engine image', default: 'mesg/engine' }),
    tag: flags.string({ name: 'Engine version', default: version.engine }),
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
  private grpc = new API('localhost:50052')
  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  private logs: GRPCStream<IExecution>

  async run() {
    const { args, flags } = this.parse(Dev)

    let definition: IProcess
    let deployedProcess: IProcess

    const tasks = new Listr<Environment.IStart>([
      Environment.start,
      {
        title: 'Compiling process',
        task: async ctx => {
          definition = await Process.compile(args.PROCESS_FILE, this.ipfsClient, this.lcd, this.grpc, ctx.mnemonic, flags.env)
        }
      },
      {
        title: 'Creating process',
        task: async ctx => {
          deployedProcess = await Process.create(this.lcd, definition, ctx.mnemonic)
        }
      },
      {
        title: 'Fetching process\'s logs',
        task: () => {
          this.logs = this.grpc.execution.stream({
            filter: {
              statuses: [
                ExecutionStatus.COMPLETED,
                ExecutionStatus.FAILED
              ]
            }
          })
        }
      }
    ])
    await tasks.run({
      configDir: this.config.dataDir,
      image: flags.image,
      pull: flags.pull,
      tag: flags.tag,
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
          '\n\tinputs:  ' + chalk.gray(inspect(decode(execution.inputs || {}))) +
          '\n\toutputs: ' + chalk.gray(inspect(decode(execution.outputs || {}))) +
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
        Environment.stop
      ]).run({
        configDir: this.config.dataDir
      })
    })
  }
}
