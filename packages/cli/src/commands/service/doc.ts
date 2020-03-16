import { flags, Command } from '@oclif/command'
import { readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import Listr from 'listr'
import * as Service from '../../tasks/service'

const ipfsClient = require('ipfs-http-client')

type Context = Service.ICompile | Service.IGenDock

export default class Doc extends Command {
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
    const { args, flags } = this.parse(Doc)
    const tasks = new Listr<Context>([
      Service.compile,
      Service.genDoc
    ])
    const result = await tasks.run({
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
      path: args.SERVICE_PATH,
    })
    const markdown = (result as Service.IGenDock).markdownDoc
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
