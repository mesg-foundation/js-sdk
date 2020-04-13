import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { prompt } from 'inquirer'
import { IDefinition, IService } from '@mesg/api/lib/service'
import { compile } from '../../utils/service'
import { loginFromCredential } from '../../utils/login'
import firebase, { deploy } from '../../utils/firebase'

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
          const title = task.title
          const logs = await deploy('service', definition, user.uid)
          logs.on('data', x => {
            task.title = `${title} (${x.message})`
          })
          service = await logs.promise()
        }
      }
    ])
    await tasks.run()

    this.log('')
    this.log(`Service deployed with the hash ${service.hash}`)
    this.log('')

    const { start } = await prompt({ type: 'confirm', name: 'start', message: 'Would you like to start this service?' })

    if (start) {
      const env = await this.getEnv(definition.configuration.env || [])

      const logs = await deploy('runner', {
        serviceHash: service.hash,
        env
      }, user.uid)
      logs.on('data', this.log)

      const runner = await logs.promise()
      this.log('')
      this.log(`Service started with the runner hash ${runner.hash}`)
    }

    return firebase.firestore().terminate()
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
