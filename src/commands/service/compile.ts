import {readFileSync} from 'fs'
import yaml from 'js-yaml'
import {join} from 'path'

import deployer from '../../deployer'
import Command from '../../service-command'
import MarketplacePublish from '../marketplace/publish'

export default class ServiceCompile extends Command {
  static description = 'Compile a service and upload its source to IPFS'

  static flags = {
    ...Command.flags
  }

  static strict = false

  static args = [{
    name: 'SERVICE_PATH_OR_URL',
    description: 'Path of the service or url to access it',
    default: './'
  }]

  async run(): Promise<string> {
    const {args} = this.parse(ServiceCompile)
    this.spinner.status = 'Download sources'
    const path = await deployer(await this.processUrl(args.SERVICE_PATH_OR_URL))
    const definition = this.parseYml(readFileSync(join(path, 'mesg.yml')))
    const source = await new MarketplacePublish(this.argv, this.config).deploySources(path)
    const partialManifestData = {service: {definition, source}}
    const dump = JSON.stringify(partialManifestData)
    this.log(dump)
    this.spinner.stop()
    return dump
  }

  parseYml(content: string): Definition {
    const o = yaml.safeLoad(content)
    const parseParams = params => Object.keys(params).map((key: string) => {
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
      repository: o.repository
    }
  }

  async processUrl(url: string): string {
    const marketplaceUrl = url.split('mesg://marketplace/service/')
    if (marketplaceUrl.length === 2) {
      const versionHash = marketplaceUrl[1]
      const {type, source} = await this.getAuthorizedServiceInfo('', versionHash)
      if (type === 'ipfs') {
        return `http://ipfs.app.mesg.com:8080/ipfs/${source}`
      }
      throw new Error(`unknown protocol '${type}'`)
    }
    return url
  }
}

export interface Definition {
  sid: string
  name: string
  description: string
  tasks: Task[]
  events: Event[]
  dependencies: Dependency[]
  configuration: Dependency
  repository: string
}

export interface Task {
  key: string
  name: string
  description: string
  inputs: Parameter[]
  outputs: Parameter[]
}

export interface Event {
  key: string
  name: string
  description: string
  data: Parameter[]
}

export interface Dependency {
  key: string
  image: string
  volumes: string[]
  volumesFrom: string[]
  ports: string[]
  command: string
  args: string[]
  env: string[]
}

export interface Parameter {
  name: string
  description: string
  type: string
  optional: boolean
  repeated: boolean
  object: Parameter[]
}
