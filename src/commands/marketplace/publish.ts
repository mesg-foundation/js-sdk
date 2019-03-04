import {createHash} from 'crypto'
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

  async run() {
    const {args} = this.parse(MarketplacePublish)

    const account = await this.getAccount()
    this.spinner.start('Deploy service')
    this.spinner.status = 'Creating manifest file'
    const manifest = await this.createManifest(args.SERVICE_PATH)
    const manifestHash = await this.upload(Buffer.from(JSON.stringify(manifest)))

    this.spinner.status = 'Publishing service'
    const txs = await this.preparePublishService(manifest, manifestHash, account)
    this.spinner.stop('ready')
    const passphrase = await this.getPassphrase()

    const results: any[] = []
    for (let i = 0; i < txs.length; i++) {
      results.push(await this.signAndBroadcast(account, {
        ...txs[i],
        nonce: txs[i].nonce + i,
      }, passphrase))
    }
    return results
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

  async preparePublishService(manifest: Manifest, hash: string, account: string): Promise<any[]> {
    const sid = manifest.definition.sid
    const get = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.exists, {sid})
    const txs = []
    if (!get.data.exist) {
      const createService = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createService, {
        sid,
        from: account
      })
      txs.push(createService.data)
    }
    const createVersion = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createVersion, {
      from: account,
      sid,
      hash: '0x' + createHash('sha256').update(hash).digest().toString('hex'),
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
