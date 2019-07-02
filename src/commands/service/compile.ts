import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import { join } from 'path'

import deployer from '../../utils/deployer'
import Command from '../../root-command'
import MarketplacePublish from '../marketplace/publish'
import { Service } from 'mesg-js/lib/api';

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

  async run(): Promise<Service> {
    const { args } = this.parse(ServiceCompile)
    this.spinner.status = 'Download sources'
    const path = await deployer(await this.processUrl(args.SERVICE_PATH_OR_URL))
    const source = await new MarketplacePublish(this.argv, this.config).deploySources(path)
    const definition = this.parseYml(readFileSync(join(path, 'mesg.yml')).toString(), source)
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  parseYml(content: string, source: string): Service {
    const o = yaml.safeLoad(content)
    const parseParams = (params: any): any => Object.keys(params || {})
      .map((key: string) => {
        const { name, description, type, repeated, optional, object } = params[key]
        return { key, name, description, type, repeated, optional, object: parseParams(object || {}) }
      })
    return {
      sid: o.sid,
      name: o.name,
      description: o.description,
      tasks: Object.keys(o.tasks || {}).map((key: string) => {
        const { name, description, inputs, outputs } = o.tasks[key]
        return { key, name, description, inputs: parseParams(inputs), outputs: parseParams(outputs) }
      }),
      events: Object.keys(o.events || {}).map((key: string) => {
        const { name, description, data } = o.events[key]
        return { key, name, description, data: parseParams(data) }
      }),
      dependencies: Object.keys(o.dependencies || {}).map((key: string) => ({ key, ...o.dependencies[key] })),
      configuration: o.configuration,
      repository: o.repository,
      source
    }
  }

  // async getAuthorizedServiceInfo(id: string, versionHash: string): Promise<ServiceInfo> {
  //   const list = await this.executeAndCaptureError(services.account.id, services.account.tasks.list)
  //   const { addresses } = list.data
  //   this.require(addresses.length > 0, 'you have no accounts. please add an authorized account in order to deploy this service')
  //   const res = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.isAuthorized, {
  //     id,
  //     versionHash,
  //     addresses
  //   })
  //   const { authorized, sid, source, type } = res.data
  //   this.require(authorized, 'you have no authorized accounts. please add an authorized account in order to deploy this service')
  //   return { sid, source, type }
  // }

  async processUrl(url: string): Promise<string> {
    return url

    //   const marketplaceUrl = url.split('mesg://marketplace/service/')
    //   if (marketplaceUrl.length === 2) {
    //     const versionHash = marketplaceUrl[1]
    //     const {type, source} = await this.getAuthorizedServiceInfo('', versionHash)
    //     if (type === 'ipfs') {
    //       return `http://ipfs.app.mesg.com:8080/ipfs/${source}` // tslint:disable-line:no-http-string
    //     }
    //     throw new Error(`unknown protocol '${type}'`)
    //   }
    //   return url
  }
}
