import { flags, Command } from '@oclif/command'
import { IProcess } from '@mesg/api/lib/process-lcd'
import { cli } from 'cli-ux'
import Listr from 'listr'
import * as Environment from '../../tasks/environment'
import * as Process from '../../tasks/process'
import version from '../../version'
import API from '@mesg/api'
import LCDClient from '@mesg/api/lib/lcd'
import { join } from 'path'
const ipfsClient = require('ipfs-http-client')

export default class ProcessCompile extends Command {
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

  async run(): Promise<IProcess> {
    const { args, flags } = this.parse(ProcessCompile)

    const tasks = new Listr<Environment.IStart | Process.ICompile | Process.ICreate>([
      Environment.start,
      Process.compile,
      Process.create,
    ])
    const res = await tasks.run({
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

    cli.styledJSON((res as Process.ICompile).process)
    return (res as Process.ICompile).process
  }
}
