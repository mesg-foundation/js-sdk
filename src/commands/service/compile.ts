import {readFileSync} from 'fs'
import getSize from 'get-folder-size'
import {Service} from 'mesg-js/lib/api/types'
import {join} from 'path'
import {promisify} from 'util'

import {WithoutPassphrase} from '../../account-command'
import MarketplaceCommand from '../../marketplace-command'
import Command from '../../root-command'
import compile from '../../utils/compiler'
import deployer, {createTar} from '../../utils/deployer'

const MB = 1024 * 1024
const MAX_UPLOAD_SIZE = MB * 10

const ipfsClient = require('ipfs-http-client')

export default class ServiceCompile extends Command {
  static description = 'Compile a service and upload its source to IPFS server'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'SERVICE',
    description: 'Path or url ([https|mesg]://) of a service',
    default: './'
  }]

  private readonly IPFS = ipfsClient('ipfs.app.mesg.com', '5001', {protocol: 'http'})

  async run(): Promise<Service> {
    const {args} = this.parse(ServiceCompile)
    this.spinner.status = 'Download sources'
    const path = await deployer(await this.processUrl(args.SERVICE))
    const definition = await compile(readFileSync(join(path, 'mesg.yml')))
    definition.source = await this.deploySources(path)
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  async getAuthorizedServiceInfo(id: string, versionHash: string): Promise<{ sid: string, source: string, type: string }> {
    const {addresses} = await this.execute({
      instanceHash: await this.engineServiceInstance(WithoutPassphrase.SERVICE_NAME),
      taskKey: 'list',
      inputs: JSON.stringify({})
    })
    if (!addresses.length) {
      throw new Error('no available account. please add an authorized account in order to deploy the service')
    }

    const {authorized, sid, source, type} = await this.execute({
      instanceHash: await this.engineServiceInstance(MarketplaceCommand.SERVICE_NAME),
      taskKey: 'isAuthorized',
      inputs: JSON.stringify({
        id,
        versionHash,
        addresses
      })
    })
    if (!authorized) {
      throw new Error('no available account. please add an authorized account in order to deploy the service')
    }
    return {sid, source, type}
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

  private async deploySources(path: string): Promise<string> {
    const size = await promisify(getSize)(path) as number
    if (size > MAX_UPLOAD_SIZE) throw new Error(`Max size upload ${MAX_UPLOAD_SIZE / MB}MB`)
    const buffer: any[] = []
    return new Promise<string>((resolve, reject) => {
      createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => resolve(await this.upload(Buffer.from(buffer)))
        )
    })
  }

  private async upload(buffer: Buffer): Promise<string> {
    const res = await this.IPFS.add(Buffer.from(buffer), {pin: true})
    if (!res.length) {
      throw new Error('pushing service manifest failed: run service:compile again')
    }
    return res[0].hash
  }
}
