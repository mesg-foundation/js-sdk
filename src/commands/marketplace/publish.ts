import {readdirSync, readFileSync} from 'fs'
import {safeLoad} from 'js-yaml'
import {join} from 'path'

import Command, {Manifest} from '../../marketplace-command'
import services from '../../services'
import ServiceDeploy from '../service/deploy'

const ipfsClient = require('ipfs-http-client')

export default class MarketplacePublish extends Command {
  static description = 'Publish a service on the MESG Marketplace'

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    required: true,
    default: './'
  }]

  private IPFS = ipfsClient('ipfs.infura.io', '5001', {protocol: 'https'})

  private account: string | null = null

  async run() {
    const {args} = this.parse(MarketplacePublish)

    this.account = await this.getAccount()
    if (!this.account) {
      this.error('You need to create an account first.')
      return
    }

    this.spinner.start('Deploy service')
    this.spinner.status = 'Creating manifest file'
    const manifest = await this.createManifest(args.SERVICE_PATH)
    const manifestHash = await this.upload(Buffer.from(JSON.stringify(manifest)))
    this.log(manifestHash)

    this.spinner.status = 'Publishing service'
    const txs = await this.preparePublishService(manifest, manifestHash)
    this.spinner.stop()
    // txs.map(x => this.signAndBroadcast(x, flags)

    this.styledJSON(txs)
  }

  async createManifest(path: string): Promise<Manifest> {
    const cmd = new ServiceDeploy(this.argv, this.config)
    const buffer: any[] = []
    return new Promise<Manifest>(resolve => {
      cmd.createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .on('end', async () => resolve({
          version: 1,
          definition: safeLoad(readFileSync(join(path, 'mesg.yml')).toString()),
          readme: this.lookupReadme(path),
          service: {
            deployment: {
              type: 'IPFS',
              source: await this.upload(Buffer.from(buffer))
            }
          }
        })
      )
    })
  }

  async preparePublishService(manifest: Manifest, hash: string): Promise<any[]> {
    const sid = manifest.definition.sid
    const get = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.exists, {sid})
    const txs = []
    if (!get.data.exist) {
      const createService = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createService, {
        sid,
        from: this.account
      })
      txs.push(createService.data)
    }
    const createVersion = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createVersion, {
      from: this.account,
      sid,
      hash,
      manifest: JSON.stringify(manifest),
      manifestProtocol: 'IPFS'
    })
    txs.push(createVersion.data)
    return txs
  }

  private lookupReadme(path: string): string {
    const readmeRegexp = /^readme(.md)?$/i
    const readme = readdirSync(path).find(x => !!x.match(readmeRegexp))
    if (!readme) { return '' }
    return readFileSync(join(path, readme)).toString()
  }

  private async upload(buffer: Buffer): Promise<string> {
    const res = await this.IPFS.add(Buffer.from(buffer))
    if (!res.length) {
      throw new Error('Error with the generation of your manifest')
    }
    return res[0].hash
  }
}
