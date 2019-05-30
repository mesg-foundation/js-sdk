import {flags} from '@oclif/command'
import {readFileSync, readdirSync, writeFileSync} from 'fs'
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
    await this.saveReadme(args.SERVICE_PATH, flags.save, markdown)
    return markdown
  }

  generateTemplate(data: any) {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    const template = readFileSync(join(__dirname, '..', '..', 'doc.md')).toString()
    return compile(template)(data)
  }

  async saveReadme(servicePath: string, shouldSave: boolean, markdown: string) {
    if (!shouldSave) {
      this.log(markdown)
      return
    }
    let defaultReadmeFileName = readdirSync(servicePath).find(file => {
      return /^readme(?:.(?:md|txt)+)?$/i.test(file)
    })
    let readmeFileName = defaultReadmeFileName || 'README.md'
    writeFileSync(join(servicePath, readmeFileName), markdown)
  }
}
