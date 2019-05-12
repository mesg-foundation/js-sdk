import {cli} from 'cli-ux'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'

import Command from '../../marketplace-command'
import {Service, ServiceID} from '../../service-command'
import services from '../../services'
import ServiceDeploy from '../service/deploy'
import ServiceDetail from '../service/detail'

const ipfsClient = require('ipfs-http-client')

export default class MarketplacePublish extends Command {
  static description = 'Publish a service on the MESG Marketplace'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    required: true,
    default: './'
  }]

  private readonly IPFS = ipfsClient('ipfs.infura.io', '5001', {protocol: 'https'})

  async run() {
    const {args} = this.parse(MarketplacePublish)
    const path = args.SERVICE_PATH

    const account = await this.getAccount()

    this.spinner.start('Deploy service')
    const [deployedService] = (await ServiceDeploy.run([path, '--silent'])) as ServiceID[]
    this.require(deployedService, 'Deployed service issue')

    const [service] = (await ServiceDetail.run([deployedService.hash, '--silent'])) as Service[]

    this.spinner.status = 'Upload sources'
    const sources = await this.deploySources(path)

    this.spinner.status = 'Preparing service'
    const serviceTx = await this.preparePublishService({
      definition: service.definition,
      readme: this.lookupReadme(path),
      hash: service.definition.hash,
      hashVersion: '1',
      deployment: {
        type: 'ipfs',
        source: sources
      }
    }, account)
    this.spinner.stop('ready')
    if (!await cli.confirm(`Ready to send a transaction to ${serviceTx.to} with the account ${account}?`)) {
      return null
    }
    const passphrase = await this.getPassphrase()

    this.spinner.start('Publish service')

    const marketplaceService = await this.publishService(account, serviceTx, passphrase)
    this.styledJSON(marketplaceService)
    return marketplaceService
  }

  async deploySources(path: string): Promise<string> {
    const cmd = new ServiceDeploy(this.argv, this.config)
    const buffer: any[] = []
    return new Promise<string>((resolve, reject) => {
      cmd.createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => resolve(await this.upload(Buffer.from(buffer)))
        )
    })
  }

  async preparePublishService(service: any, account: string): Promise<any> {
    const publishTx = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.prepareCreateVersion, {
      service,
      from: account
    })
    return publishTx.data
  }

  async publishService(account: string, serviceTx: any, passphrase: string): Promise<any> {
    const signedTx = await this.sign(account, serviceTx, passphrase)
    const service = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.publishCreateVersion, signedTx)
    return service.data
  }

  private lookupReadme(path: string): string {
    const readmeRegexp = /^readme(.md)?$/i
    const readme = readdirSync(path).find(x => !!x.match(readmeRegexp))
    if (!readme) {
      return ''
    }
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
