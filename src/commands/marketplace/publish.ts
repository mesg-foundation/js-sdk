import {cli} from 'cli-ux'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'

import Command from '../../marketplace-command'
import ServiceCompile from '../service/compile'
import ServiceCreate from '../service/create'
import ServiceDetail from '../service/detail'

export default class MarketplacePublish extends Command {
  static description = 'Publish a service'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'SERVICE_PATH',
    description: 'Path of the service',
    required: true,
    default: './'
  }]

  async run() {
    const {args} = this.parse(MarketplacePublish)
    const path = args.SERVICE_PATH

    const account = await this.getAccount()

    this.spinner.start('Preparing service')

    this.spinner.status = 'compiling'
    const compiledService = await ServiceCompile.run([path, '--silent'])

    this.spinner.status = 'deploying'
    const createResponse = await ServiceCreate.run([JSON.stringify(compiledService), '--silent'])
    const definition = await ServiceDetail.run([createResponse.hash, '--silent'])

    this.spinner.status = 'preparing transaction'
    const serviceTx = await this.preparePublishService({
      definition,
      readme: this.lookupReadme(path),
      hash: definition.hash,
      hashVersion: '1',
      deployment: {
        type: 'ipfs',
        source: definition.source
      }
    }, account)
    this.spinner.stop()

    if (!await cli.confirm(`Do you confirm to send a transaction to ${serviceTx.to} with the account ${account}?`)) {
      return null
    }
    
    const passphrase = await this.getPassphrase()
    this.spinner.start('Publishing service')
    const marketplaceService = await this.publishService(account, serviceTx, passphrase)
    this.spinner.stop()
    this.styledJSON(marketplaceService)
    return marketplaceService
  }

  async preparePublishService(service: any, account: string): Promise<any> {
    return this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'preparePublishServiceVersion',
      inputs: JSON.stringify({
        service,
        from: account
      })
    })
  }

  async publishService(account: string, serviceTx: any, passphrase: string): Promise<any> {
    const signedTx = await this.sign(account, serviceTx, passphrase)
    return this.execute({
      instanceHash: await this.engineServiceInstance(Command.SERVICE_NAME),
      taskKey: 'publishPublishServiceVersion',
      inputs: JSON.stringify(signedTx)
    })
  }

  private lookupReadme(path: string): string {
    const readmeRegexp = /^readme(.md)?$/i
    const readme = readdirSync(path).find(x => !!x.match(readmeRegexp))
    if (!readme) {
      return ''
    }
    return readFileSync(join(path, readme)).toString()
  }
}
