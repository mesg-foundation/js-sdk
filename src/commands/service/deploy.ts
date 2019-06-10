import {flags} from '@oclif/command'
import {existsSync, readdirSync, readFileSync} from 'fs'
import ignore from 'ignore'
import {join} from 'path'
import {Readable, Writable} from 'stream'
import tar from 'tar'

import deployer from '../../deployer'
import Command, {ServiceID} from '../../service-command'

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

  static strict = false

  static args = [{
    name: 'SERVICE_PATH_OR_URL',
    description: 'Path of the service or url to access it',
    default: './'
  }]

  async run(): Promise<ServiceID[]> {
    const {argv, flags} = this.parse(ServiceDeploy)

    this.spinner.start('Deploy service')
    let deployed: ServiceID[] = []
    for (const url of argv) {
      this.spinner.status = 'Download sources'
      const path = await deployer(await this.processUrl(url))

      try {
        deployed.push(await new Promise((resolve: (value: ServiceID) => void, reject: (reason: Error) => void) => {
          const stream = this.mesg.api.DeployService()
          stream.on('error', (error: Error) => {
            throw error
          })
          stream.on('data', (data: any) => this.handleDeploymentResponse(data, resolve, reject))
          this.writeEnv(stream, flags.env)

          this.createTar(path)
            .on('end', () => stream.end(''))
            .on('error', (error: Error) => {
              throw error
            })
            .on('data', (chunk: Buffer) => {
              if (chunk.length > 0) stream.write({chunk})
            })
        }))
      } catch (e) {
        this.error(e)
      }
    }
    this.spinner.stop(deployed.map((x: any) => x.sid).join(', '))
    return deployed
  }

  createTar(path: string): Readable {
    const mesgignore = join(path, '.mesgignore')
    const ig = ignore().add([
      '.git',
      ...(existsSync(mesgignore) ? readFileSync(mesgignore).toString().split('\n') : [])
    ])
    return tar.create({
      cwd: path,
      filter: ig.createFilter(),
      strict: true,
      gzip: true,
      portable: true,
    }, readdirSync(path))
      .on('error', (error: Error) => {
        throw error
      })
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

  handleDeploymentResponse(x: any, resolve: (value: ServiceID) => void, reject: (reason: Error) => void) {
    if (x.status) {
      this.spinner.status = x.status.message
      return
    }
    return x.service ? resolve(x.service) : reject(x.validationError)
  }

  async processUrl(url: string): Promise<string> {
    const marketplaceUrl = url.split('mesg://marketplace/service/')
    if (marketplaceUrl.length === 2) {
      const versionHash = marketplaceUrl[1]
      const {type, source} = await this.getAuthorizedServiceInfo('', versionHash)
      if (type === 'ipfs') {
        return `http://ipfs.app.mesg.com:8080/ipfs/${source}` // tslint:disable-line:no-http-string
      }
      throw new Error(`unknown protocol '${type}'`)
    }
    return url
  }
}
