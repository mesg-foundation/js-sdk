import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { prompt } from 'inquirer'
import { IService, IDefinition } from '@mesg/api/lib/service-lcd'
import { compile } from '../../utils/service'
import { loginFromCredential } from '../../utils/login'

const ipfsClient = require('ipfs-http-client')

export default class Service extends Command {
  static description = 'Deploy a service'

  static flags = {
    password: flags.string({ description: "Password of your account" })
  }

  static args = [{
    name: 'PATH',
    description: 'Path or url of a service',
    default: './'
  }]

  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  async run() {
    const { args, flags } = this.parse(Service)

    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Type the password of your account' }])) as any).password


    let definition: IDefinition
    let service: IService

    await loginFromCredential(this.config.configDir, password)
    const tasks = new Listr([
      {
        title: 'Compiling service',
        task: async () => {
          definition = await compile(args.PATH, this.ipfsClient)
        }
      },
      {
        title: 'Creating service',
        task: async () => {
          this.log('coming soon')
          // service = await create(lcd, definition, credential.mnemonic)
        }
      },
    ])
    await tasks.run()

    this.log(`Service deployed with the hash ${service.hash}`)
    this.log(`https://explorer.testnet.mesg.com/services/${service.hash}`)
  }
}
