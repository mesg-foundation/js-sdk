import { Command, flags } from '@oclif/command'
import Listr from 'listr'
import { prompt } from 'inquirer'
import { IDefinition, IProcess } from '@mesg/api/lib/process'
import { compile } from '../../utils/process'
import * as Service from '../../utils/service'
import { loginFromCredential } from '../../utils/login'
import firebase, { deploy } from '../../utils/firebase'

const ipfsClient = require('ipfs-http-client')

export default class Process extends Command {
  static description = 'Deploy a process'

  static flags = {
    password: flags.string({ description: "Password of your account" }),
    env: flags.string({
      description: 'Environment variables to inject to the process',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'PROCESS_FILE',
    description: 'Path of a process file'
  }]

  private ipfsClient = ipfsClient('ipfs.app.mesg.com', '5001', { protocol: 'http' })

  async run() {
    const { args, flags } = this.parse(Process)

    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Type the password of your account' }])) as any).password


    let definition: IDefinition
    let process: IProcess

    const { user } = await loginFromCredential(this.config.configDir, password)
    const tasks = new Listr([
      {
        title: 'Compiling process',
        task: async (ctx, task) => {
          const compilation = await compile(
            args.PROCESS_FILE,
            flags.env,
            async ({ src, env }) => {
              let title = `deploying ${src}`
              task.output = title
              const definition = await Service.compile(src, this.ipfsClient)
              const serviceLogs = await deploy('service', definition, user.uid)
              serviceLogs.on('data', x => task.output = `${title} (${x.message})`)
              const service = await serviceLogs.promise()

              title = `starting ${src}`
              task.output = title
              const runnerLogs = await deploy('runner', { serviceHash: service.hash, env }, user.uid)
              runnerLogs.on('data', x => task.output = `${title} (${x.message})`)
              const runner = await runnerLogs.promise()

              return {
                hash: runner.hash,
                instanceHash: runner.instanceHash
              }
            }
          )
          definition = compilation.definition
        }
      },
      {
        title: 'Creating process',
        task: async (ctx, task) => {
          const logs = await deploy('process', definition, user.uid)
          logs.on('data', x => task.output = x.message)
          process = await logs.promise()
        }
      }
    ])
    await tasks.run()

    this.log('')
    this.log(`Process deployed with the hash ${process.hash}`)
    this.log('')

    return firebase.firestore().terminate()
  }
}
