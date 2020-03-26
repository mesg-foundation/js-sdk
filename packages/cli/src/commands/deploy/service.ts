import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import LCD from '@mesg/api/lib/lcd'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import { join } from 'path'
import { parse } from 'url'
import { prompt } from 'inquirer'
import { Credential } from '../login'
import { IService, IDefinition } from '@mesg/api/lib/service-lcd'
import { compile, create } from '../../utils/service'

const ipfsClient = require('ipfs-http-client')

export default class Service extends Command {
  static description = 'Deploy a service'

  static flags = {
    registry: flags.string({ name: 'Registry to use', required: true, default: 'http://localhost:1317' }),
    password: flags.string({ description: "Password of your account" }),
  }

  static args = [{
    name: 'PATH',
    description: 'Path or url of a service',
    default: './'
  }]

  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })
  private vault = new Vault<Credential>(new FileStore(join(this.config.configDir, 'credentials.json')))

  async run() {
    const { args, flags } = this.parse(Service)
    const lcd = new LCD(flags.registry)

    const key = parse(flags.registry).hostname
    if (!this.vault.contains(key)) this.error('no account found, please run `mesg-cli login`')
    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Type the password of your account' }])) as any).password

    const credential = this.vault.get(key, password)

    let definition: IDefinition
    let service: IService

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
          service = await create(lcd, definition, credential.mnemonic)
        }
      },
    ])
    await tasks.run()

    this.log(`Service deployed with the hash ${service.hash}`)
    this.log(`https://explorer.testnet.mesg.com/services/${service.hash}`)
  }
}
