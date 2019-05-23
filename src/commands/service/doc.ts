import {readFileSync, readdirSync, writeFile} from 'fs'
import {compile, registerHelper} from 'handlebars'
import {safeLoad} from 'js-yaml'
import {join} from 'path'
import cli from 'cli-ux'

import Command from '../../service-command'

export default class ServiceDoc extends Command {
  static description = 'Generate the documentation for the service in a README.md file'

  static aliases = ['service:doc', 'service:docs']

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    default: './'
  }]

  async run(): Promise<string> {
    const {args} = this.parse(ServiceDoc)
    const definition = safeLoad(readFileSync(join(args.SERVICE_PATH, 'mesg.yml')).toString())
    const markdown = this.generateTemplate(definition)
    await this.saveReadme(args.SERVICE_PATH, markdown)
    return markdown
  }

  generateTemplate(data: any) {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    const template = readFileSync(join(__dirname, '..', '..', 'doc.md')).toString()
    return compile(template)(data)
  }

  async saveReadme(servicePath: string, markdown: string) {
    let readmeFileName = readdirSync(servicePath).find(file => {
      return /^readme(?:.(?:md|txt)+)?$/i.test(file)
    })
    if(readmeFileName
      && !await cli.confirm(`This will overwrite the '${readmeFileName}' file. Do you confirm?`)) {
      return
    }
    readmeFileName = readmeFileName || 'README.md'
    writeFile(join(servicePath, readmeFileName), markdown, (err) => {
      if(err) throw err
    })
  }
}
