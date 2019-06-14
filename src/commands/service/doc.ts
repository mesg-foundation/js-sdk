import {flags} from '@oclif/command'
import {readdirSync, readFileSync, writeFileSync} from 'fs'
import {compile, registerHelper} from 'handlebars'
import {safeLoad} from 'js-yaml'
import {join} from 'path'

import Command from '../../service-command'

export default class ServiceDoc extends Command {
  static description = 'Generate the documentation for the service in a README.md file'

  static aliases = ['service:doc', 'service:docs']

  static flags = {
    ...Command.flags,
    save: flags.boolean({char: 's', description: 'Save to default readme file'}),
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run(): Promise<string> {
    const {args, flags} = this.parse(ServiceDoc)
    const definition = safeLoad(readFileSync(join(args.SERVICE_PATH, 'mesg.yml')).toString())
    const markdown = this.generateTemplate(definition)
    if (flags.save) {
      this.saveReadme(args.SERVICE_PATH, markdown)
    } else {
      this.log(markdown)
    }
    return markdown
  }

  generateTemplate(data: any) {
    registerHelper('or', (a: any, b: any) => a ? a : b)
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
