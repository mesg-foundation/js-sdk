import { flags } from '@oclif/command'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { compile, registerHelper } from 'handlebars'
import { safeLoad } from 'js-yaml'
import { join } from 'path'

import Command from '../../root-command'

export default class ServiceDoc extends Command {
  static description = 'Generate documentation for service and print it on stdout'

  static flags = {
    ...Command.flags,
    save: flags.boolean({ char: 's', description: 'Save to default readme file' }),
  }

  static args = [{
    name: 'SERVICE',
    description: 'Path of a service',
    default: './'
  }]

  async run(): Promise<string> {
    const { args, flags } = this.parse(ServiceDoc)
    const definition = safeLoad(readFileSync(join(args.SERVICE, 'mesg.yml')).toString())
    const markdown = this.generateTemplate(definition)
    if (flags.save) {
      this.saveReadme(args.SERVICE, markdown)
    } else {
      this.log(markdown)
    }
    return markdown
  }

  generateTemplate(data: any) {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    registerHelper('toJSON', function (obj) {
      return JSON.stringify(obj);
    });
    const template = readFileSync(join(__dirname, '..', '..', '..', 'assets', 'doc.md')).toString()
    return compile(template)(data)
  }

  saveReadme(servicePath: string, markdown: string) {
    const defaultReadmeFileName = readdirSync(servicePath).find(file => {
      return /^readme(?:.(?:md|txt)+)?$/i.test(file)
    })
    const readmeFileName = defaultReadmeFileName || 'README.md'
    writeFileSync(join(servicePath, readmeFileName), markdown)
  }
}
