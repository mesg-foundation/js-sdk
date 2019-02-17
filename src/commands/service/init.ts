import {flags} from '@oclif/command'

import Command from '../../service-command'

export default class ServiceInit extends Command {
  static description = 'Initialize a service by creating a mesg.yml and Dockerfile in a dedicated directory.'

  static flags = {
    ...Command.flags,
    template: flags.string({char: 't', description: 'Specify the template URL to use'}),
  }

  static args = [{
    name: 'DIR',
    default: './',
    required: true,
    description: 'Create the service in the directory'
  }]

  async run() {
    // TODO
    const {args, flags} = this.parse(ServiceInit)

    this.log('init', args, flags)

  }
}
