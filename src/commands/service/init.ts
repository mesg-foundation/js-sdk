import {flags} from '@oclif/command'
import axios from 'axios'
import {renameSync} from 'fs'
import {prompt} from 'inquirer'
import {join} from 'path'

import Command from '../../service-command'

import deployer from '../../deployer'

const templatesURL = 'https://raw.githubusercontent.com/mesg-foundation/awesome/master/templates.json'

interface Template {
  name: string
  url: string
}

export default class ServiceInit extends Command {
  static description = 'Initialize a service by creating a mesg.yml and Dockerfile in a dedicated directory.'

  static flags = {
    ...Command.flags,
    template: flags.string({char: 't', description: 'Specify the template URL to use'}),
  }

  static args = [{
    name: 'DIR',
    required: true,
    description: 'Create the service in the directory'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceInit)
    const templateUrl = await this.getTemplateUrl(flags.template)
    this.spinner.start('Initialize your project')
    await this.downloadTemplate(args.DIR, templateUrl)
    this.spinner.stop(args.DIR)
    return args.DIR
  }

  async getTemplateUrl(template: string | undefined) {
    if (template) { return template }
    this.spinner.start('Fetch the list of templates available')
    const templates = await this.fetchTemplates()
    this.spinner.stop()
    const {value} = (await prompt({
      type: 'list',
      name: 'value',
      message: 'Choose the template you want to use',
      default: 'Basic',
      choices: templates.map(x => ({
        name: `${x.name} ➜ ${x.url}`,
        value: x.name,
        short: x.name
      }))
    })) as {value: string}

    const selectedTemplate = templates.find(x => x.name === value)
    if (!selectedTemplate) {
      throw new Error(`The template "${value}" is not valid`)
    }
    return selectedTemplate.url
  }

  async fetchTemplates() {
    const response = await axios.get(templatesURL)
    return response.data as Template[]
  }

  async downloadTemplate(path: string, url: string) {
    const tmpPath = await deployer(url)
    renameSync(join(tmpPath, 'template'), path)
  }
}
