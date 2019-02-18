import {flags} from '@oclif/command'
import cli from 'cli-ux'
import {readdirSync} from 'fs'
import {Readable, Writable} from 'stream'
import tar from 'tar'

import Command from '../../service-command'

import deployer from '../../deployer'

export default class ServiceDeploy extends Command {
  static description = 'Deploy a service'

  static flags = {
    ...Command.flags,
    env: flags.string({
      description: 'set env defined in mesg.yml (configuration.env)',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_PATH_OR_URL',
    description: 'Path of the service or url to access it',
    default: './'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceDeploy)

    cli.action.start('Deploy service')
    cli.action.status = 'Download sources'
    const path = await deployer(args.SERVICE_PATH_OR_URL)

    try {
      const serviceId = await new Promise((resolve: (value: string) => void, reject: (reason: Error) => void) => {
        const stream = this.mesg.api.DeployService()
        stream.on('error', (error: Error) => { throw error })
        stream.on('data', (data: any) => this.handleDeploymentResponse(data, resolve, reject))
        this.writeEnv(stream, flags.env)

        this.createTar(path)
          .on('end', () => stream.end(''))
          .on('data', (chunk: Buffer) => {
            if (chunk.length > 0) stream.write({chunk})
          })
      })
      return serviceId
    } catch (e) {
      this.warn(e)
      return e
    }
  }

  createTar(path: string): Readable {
    const ignore = ['.git']
    const options = {
      cwd: path,
      filter: (path: string) => !ignore.includes(path),
      strict: true,
      gzip: true,
    }
    return tar.create(options, readdirSync(path))
      .on('error', (error: Error) => { throw error })
  }

  writeEnv(stream: Writable, envList: string[]) {
    if (!envList || envList.length === 0) return
    const env = envList.reduce((prev, item) => {
      const [key, value] = item.split('=')
      return {
        ...prev,
        [key]: value
      }
    }, {})
    stream.write({env})
  }

  handleDeploymentResponse(x: any, resolve: (value: string) => void, reject: (reason: Error) => void) {
    if (x.status) {
      cli.action.status = x.status.message
      return
    }
    if (x.serviceID) {
      cli.action.stop(x.serviceID)
      return resolve(x.serviceID)
    }
    cli.action.stop('failed')
    return reject(x.validationError)
  }
}
