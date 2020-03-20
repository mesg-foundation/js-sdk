import { flags, Command } from '@oclif/command'
import { readdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import * as Service from '../../utils/service'
import { registerHelper, compile } from 'handlebars'

const ipfsClient = require('ipfs-http-client')

export default class Doc extends Command {
  static description = 'Generate documentation for service and print it to stdout'

  static flags = {
    save: flags.boolean({ char: 's', description: 'Save to default readme file' }),
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of a service',
    default: './'
  }]

  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  async run(): Promise<string> {
    const { args, flags } = this.parse(Doc)

    const definition = await Service.compile(args.SERVICE_PATH, this.ipfsClient)

    registerHelper('or', (a: any, b: any) => a ? a : b)
    registerHelper('toJSON', JSON.stringify)
    const template = readFileSync(join(__dirname, '..', 'assets', 'doc.md')).toString()
    const markdown = compile(template)(definition)

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
