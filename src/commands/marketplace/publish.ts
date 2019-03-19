import {cli} from 'cli-ux'
import {readdirSync, readFileSync} from 'fs'
import {safeLoad} from 'js-yaml'
import {join} from 'path'

import Command, {Manifest} from '../../marketplace-command'
import {Service} from '../../service-command'
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

    this.spinner.status = 'Preparing service'
    const serviceTx = await this.preparePublishService(manifest, manifestHash, account)
    this.spinner.stop('ready')
    if (!await cli.confirm(`Ready to send a transaction to ${serviceTx.to} with the account ${account}?`)) {
      return null
    }
    const passphrase = await this.getPassphrase()

    this.spinner.start('Publish service')

    const transaction = this.waitForTransaction(manifestHash)
    await this.signAndBroadcast(account, serviceTx, passphrase)
    this.spinner.status = 'Waiting transaction to be mined'
    const result = await transaction
    this.styledJSON(result)
    return result
  }

  async createManifest(path: string): Promise<Manifest> {
    const cmd = new ServiceDeploy(this.argv, this.config)
    this.spinner.status = 'Deploy service'
    const services = (await ServiceDeploy.run([path, '--silent'])) as Service[]
    if (services.length !== 1) {
      throw new Error('Deployed service issue')
    }
    this.spinner.status = 'Upload sources'
    const buffer: any[] = []
    return new Promise<Manifest>((resolve, reject) => {
      cmd.createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => resolve({
          version: 1,
          service: {
            definition: safeLoad(readFileSync(join(path, 'mesg.yml')).toString()),
            readme: this.lookupReadme(path),
            hash: services[0].hash,
            hashVersion: '1',
            deployment: {
              type: 'ipfs',
              source: await this.upload(Buffer.from(buffer))
            }
          }
        })
      )
    })
  }

  async preparePublishService(manifest: Manifest, hash: string, account: string): Promise<any> {
    const publishTx = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.createVersion, {
      from: account,
      sid: manifest.service.definition.sid,
      manifest: hash,
      manifestProtocol: 'ipfs'
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

  private async waitForTransaction(manifestHash: string): Promise<any> {
    return this.listenEventOnce(
      services.marketplace.id,
      services.marketplace.events.serviceVersionCreated,
      (data: any) => data.manifest === manifestHash
    )
  }
}
