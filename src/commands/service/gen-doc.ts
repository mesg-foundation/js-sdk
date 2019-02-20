import {readFileSync} from 'fs'
import {compile, registerHelper} from 'handlebars'
import {safeLoad} from 'js-yaml'
import {join} from 'path'

import Command from '../../service-command'

export default class ServiceGenDoc extends Command {
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

  async run() {
    const {args} = this.parse(ServiceGenDoc)
    const definition = safeLoad(readFileSync(join(args.SERVICE_PATH, 'mesg.yml')).toString())
    const markdown = this.generateTemplate(definition)
    this.log(markdown)
    return markdown
  }

  generateTemplate(data: any) {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    const template = readFileSync(join(__dirname, '..', '..', 'doc.md')).toString()
    return compile(template)(data)
  }
}
