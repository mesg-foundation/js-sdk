import { Command } from '@oclif/command'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'

export default class Dev extends Command {
  static description = 'Start a dev environment for your project'

  static flags = {}

  static args = [{
    name: 'PATH',
    description: 'Path of your project',
    default: './'
  }]

  async run() {
    const { args } = this.parse(Dev)

    if (!existsSync(join(args.PATH, 'services'))) this.error(`${args.PATH} is not a recognized as a MESG project`)
    const services = readdirSync(join(args.PATH, 'services'), { withFileTypes: true })
      .filter(x => x.isDirectory())
    
    console.log(services)
    // TODO: compile/deploy services
    // TODO: list all processes
    // TODO: read env
    // TODO: deploy processes
    // TODO: logs, logs, logs
    // TODO: ui in the terminal? 

    process.once('SIGINT', async () => { })
  }
}
