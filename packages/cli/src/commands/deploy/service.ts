import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { prompt } from 'inquirer'
import { IDefinition } from '@mesg/api/lib/service'
import { compile } from '../../utils/service'
import { loginFromCredential } from '../../utils/login'
import firebase from '../../utils/firebase'

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
    let serviceHash: string

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
        task: async () => {
          const res = await firebase.firestore().collection('services').add({
            uid: user.uid,
            definition
          })
          serviceHash = await new Promise((resolve, reject) => {
            firebase.firestore()
              .collection('services').doc(res.id)
              .onSnapshot((snapshot) => {
                const data = snapshot.data()
                if (!data.hash) return
                resolve(data.hash)
              }, reject)
          })
        }
      }
    ])
    await tasks.run()

    this.log('')
    this.log(`Service deployed with the hash ${serviceHash}`)
    this.log('')

    const { deploy } = await prompt({ type: 'confirm', name: 'deploy', message: 'Would you like to start this service?' })

    if (!deploy) return

    const env = await this.getEnv(definition.configuration.env || [])

    const res = await firebase.firestore().collection('runners').add({
      uid: user.uid,
      serviceHash: serviceHash,
      env: env
    })

    const runnerHash = await new Promise((resolve, reject) => {
      firebase.firestore()
        .collection('runners').doc(res.id)
        .onSnapshot((snapshot) => {
          const data = snapshot.data()
          if (!data.hash) return
          resolve(data.hash)
        }, reject)
    })

    this.log('')
    this.log(`Service started with the runner hash ${runnerHash}`)

    await firebase.firestore().terminate()
  }

  async getEnv(envs: string[]): Promise<string[]> {
    if (!envs.length) return []

    const res = await prompt(envs.map((x: string) => ({
      name: x.split('=')[0],
      default: x.split('=')[1],
      type: 'input'
    }))) as { [key: string]: string }
    return Object.keys(res).map(x => `${x}=${res[x]}`)
  }
}
