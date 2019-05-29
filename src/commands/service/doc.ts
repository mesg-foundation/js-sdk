import {flags} from '@oclif/command'
import {readFileSync, readdirSync, writeFile} from 'fs'
import {compile, registerHelper} from 'handlebars'
import {safeLoad} from 'js-yaml'
import {join} from 'path'

import Command from '../../service-command'

export default class ServiceDoc extends Command {
  static description = 'Generate the documentation for the service in a README.md file'

  static aliases = ['service:doc', 'service:docs']

  static flags = {
    ...Command.flags,
    save: flags.string({char: 's', description: 'Save to specified file or allow to overwrite the default readme file when used as empty or create a new one if not exists'}),
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

  async saveReadme(servicePath: string, saveFileName: string, markdown: string) {
    if (saveFileName === undefined) {
      console.log(markdown)
      return
    }
    let readmeFileName = saveFileName || 'README.md'
    if (!saveFileName) {
      let defaultReadmeFileName = readdirSync(servicePath).find(file => {
        return /^readme(?:.(?:md|txt)+)?$/i.test(file)
      })
      if (defaultReadmeFileName) {
        readmeFileName = defaultReadmeFileName
      }
    }
    writeFile(join(servicePath, readmeFileName), markdown, (err) => {
      if(err) throw err
    })
  }
}
