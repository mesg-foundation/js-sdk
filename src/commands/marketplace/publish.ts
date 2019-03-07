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
    const serviceTx = await this.preparePublishService(manifest, manifestHash, account)
    this.spinner.stop('ready')
    const passphrase = await this.getPassphrase()

    const result = await this.signAndBroadcast(account, serviceTx, passphrase)
    this.styledJSON(result)
    return result
  }

  async createManifest(path: string): Promise<Manifest> {
    const cmd = new ServiceDeploy(this.argv, this.config)
    const buffer: any[] = []
    return new Promise<Manifest>((resolve, reject) => {
      cmd.createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
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
    const publishTx = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createVersion, {
      from: account,
      sid: manifest.definition.sid,
      versionHash: '0x' + createHash('sha256').update(hash).digest().toString('hex'),
      manifest: hash,
      manifestProtocol: 'IPFS'
    })
    return publishTx.data
  }

  private lookupReadme(path: string): string {
    const readmeRegexp = /^readme(.md)?$/i
    const readme = readdirSync(path).find(x => !!x.match(readmeRegexp))
    if (!readme) { return '' }
    return readFileSync(join(path, readme)).toString()
  }

  private async upload(buffer: Buffer): Promise<string> {
    const res = await this.IPFS.add(Buffer.from(buffer), {pin: false})
    if (!res.length) {
      throw new Error('Error with the generation of your manifest')
    }
    return res[0].hash
  }
}
