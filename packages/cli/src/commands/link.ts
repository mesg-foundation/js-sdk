import { flags, Command } from '@oclif/command'
import { renameSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import deployer from '../utils/deployer'
import { service as serviceCompiler } from '@mesg/compiler'
import slug from 'slug'

export default class Link extends Command {
  static description = 'Link a service to your '

  static flags = {
    name: flags.string({ name: 'Name of the service in your project' })
  }

  static args = [{
    name: 'SERVICE',
    description: 'Link or path of your service',
    required: true
  }, {
    name: 'PATH',
    description: 'Path of your project',
    default: './'
  }]

  async run() {
    const { args, flags } = this.parse(Link)

    this.log(this.config.dataDir)

    const path = await deployer(args.SERVICE)
    const service = await serviceCompiler(readFileSync(join(path, 'mesg.yml')))

    const name = slug(flags.name || service.sid || service.name)
    const finalPath = join(args.PATH, 'services', name)
    mkdirSync(finalPath, { recursive: true })
    renameSync(path, finalPath)

    this.log(`Service ${name} linked to your project`)
  }
}
