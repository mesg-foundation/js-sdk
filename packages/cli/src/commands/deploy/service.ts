import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import LCD from '@mesg/api/lib/lcd'
import { compile, create, ICompile, ICreate } from '../../tasks/service'
import Vault from '@mesg/vault'
import FileStore from '@mesg/vault/lib/store/file'
import { join } from 'path'
import { parse } from 'url'
import { prompt } from 'inquirer'
import { Credential } from '../login'

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

  async run() {
    const { args, flags } = this.parse(Service)
    const vault = new Vault<Credential>(new FileStore(join(this.config.configDir, 'credentials.json')))
    const key = parse(flags.registry).hostname
    if (!vault.contains(key)) this.error('no account found, please run `mesg-cli login`')
    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Type the password of your account' }])) as any).password

    const credential = vault.get(key, password)

    const tasks = new Listr<ICompile | ICreate>([
      compile,
      create
    ])
    const result = await tasks.run({
      ipfsClient: ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' }),
      path: args.PATH,
      lcd: new LCD(flags.registry),
      mnemonic: credential.mnemonic
    })

    const serviceHash = (result as ICreate).serviceHash
    this.log(`Service deployed with the hash ${serviceHash}`)
    this.log(`https://explorer.testnet.mesg.com/services/${serviceHash}`)
  }
}
