import {readFileSync} from 'fs'
import yaml from 'js-yaml'
import {Service} from 'mesg-js/lib/api'
import {join} from 'path'

import {WithoutPassphrase} from '../../account-command'
import MarketplaceCommand from '../../marketplace-command'
import Command from '../../root-command'
import deployer, {createTar} from '../../utils/deployer'

const ipfsClient = require('ipfs-http-client')

export default class ServiceCompile extends Command {
  static description = 'Compile a service and upload its source to IPFS'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'SERVICE_PATH_OR_URL',
    description: 'Path of the service or url to access it',
    default: './'
  }]

  private readonly IPFS = ipfsClient('ipfs.app.mesg.com', '5001', {protocol: 'http'})

  async run(): Promise<Service> {
    const {args} = this.parse(ServiceCompile)
    this.spinner.status = 'Download sources'
    const path = await deployer(await this.processUrl(args.SERVICE_PATH_OR_URL))
    const source = await this.deploySources(path)
    const definition = this.parseYml(readFileSync(join(path, 'mesg.yml')).toString(), source)
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  parseYml(content: string, source: string): Service {
    const o = yaml.safeLoad(content)
    const parseParams = (params: any): any => Object.keys(params || {})
      .map((key: string) => {
        const {name, description, type, repeated, optional, object} = params[key]
        return {key, name, description, type, repeated, optional, object: parseParams(object || {})}
      })
    return {
      sid: o.sid,
      name: o.name,
      description: o.description,
      tasks: Object.keys(o.tasks || {}).map((key: string) => {
        const {name, description, inputs, outputs} = o.tasks[key]
        return {key, name, description, inputs: parseParams(inputs), outputs: parseParams(outputs)}
      }),
      events: Object.keys(o.events || {}).map((key: string) => {
        const {name, description, data} = o.events[key]
        return {key, name, description, data: parseParams(data)}
      }),
      dependencies: Object.keys(o.dependencies || {}).map((key: string) => ({key, ...o.dependencies[key]})),
      configuration: o.configuration,
      repository: o.repository,
      source
    }
  }

  async getAuthorizedServiceInfo(id: string, versionHash: string): Promise<{ sid: string, source: string, type: string }> {
    const {addresses} = await this.execute({
      instanceHash: await this.engineServiceInstance(WithoutPassphrase.SERVICE_NAME),
      taskKey: 'list',
      inputs: JSON.stringify({})
    })
    if (!addresses.length) {
      throw new Error('you have no accounts. please add an authorized account in order to deploy this service')
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
      throw new Error('you have no authorized accounts. please add an authorized account in order to deploy this service')
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
      throw new Error('Error with the generation of your manifest')
    }
    return res[0].hash
  }
}
