import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { prompt } from 'inquirer'
import { IDefinition } from '@mesg/api/lib/service'
import { compile } from '../../utils/service'
import { loginFromCredential } from '../../utils/login'
import firebase from '../../utils/firebase'
import styledJSON from 'cli-ux/lib/styled/json'

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
    let res: any

    const { user } = await loginFromCredential(this.config.configDir, password)
    const tasks = new Listr([
      {
        title: 'Compiling service',
        task: async () => {
          definition = await compile(args.PATH, this.ipfsClient)
        }
      },
      {
        title: 'Creating service',
        task: async (ctx, task) => {
          res = await firebase.firestore().collection('services').add({
            uid: user.uid,
            definition
          })
        }
      },
    ])
    await tasks.run()

    styledJSON(res)
    // this.log(`Service deployed with the hash ${service.hash}`)
    // this.log(`https://explorer.testnet.mesg.com/services/${service.hash}`)
  }
}
