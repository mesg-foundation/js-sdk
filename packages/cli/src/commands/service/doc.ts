import { flags, Command } from '@oclif/command'
import { readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import Listr from 'listr'
import * as Tasks from '../../tasks'

const ipfsClient = require('ipfs-http-client')

type Context = Tasks.ICompileService | Tasks.IServiceDocGenerate

export default class ServiceDoc extends Command {
  static description = 'Generate documentation for service and print it on stdout'

  static flags = {
    save: flags.boolean({ char: 's', description: 'Save to default readme file' }),
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of a service',
    default: './'
  }]

  async run(): Promise<string> {
    const { args, flags } = this.parse(ServiceDoc)
    const tasks = new Listr<Context>([
      Tasks.compileService,
      Tasks.serviceDocGen
    ])
    const result = await tasks.run({
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
      path: args.SERVICE_PATH,
    })
    const markdown = (result as Tasks.IServiceDocGenerate).markdownDoc
    const definition = (result as Tasks.ICompileService).definition
    if (flags.save) {
      const defaultReadmeFileName = readdirSync(args.SERVICE_PATH).find(file => {
        return /^readme(?:.(?:md|txt)+)?$/i.test(file)
      })
      const readmeFileName = defaultReadmeFileName || 'README.md'
      writeFileSync(join(args.SERVICE_PATH, readmeFileName), markdown)
    } else {
      this.log(markdown)
    }
    return markdown
  }
}
