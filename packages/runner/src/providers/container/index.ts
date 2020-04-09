import { Docker } from "node-docker-api"
import fetch from 'node-fetch'
import { ReadStream } from 'fs'
import API from '@mesg/api/lib/lcd'
import * as ServiceType from '@mesg/api/lib/typedef/service';
import { IService } from "@mesg/api/lib/service-lcd"
import { Provider, Env } from '../../index'
import { Network } from "node-docker-api/lib/network"
import Container from './container'
import { createHash } from 'crypto'

const ENGINE_NETWORK_NAME = 'engine'
const PREFIX = 'mesg_srv_'
const MAX_RETRY = 5

type Labels = { [key: string]: string }

export default class DockerContainer implements Provider {

  private _api: API
  private _client: Docker
  private ipfsGateway = "http://ipfs.app.mesg.com:8080/ipfs"
  private serviceEndpoint: string

  constructor(serviceEndpoint: string = ENGINE_NETWORK_NAME) {
    this._client = new Docker(null)
    this.serviceEndpoint = serviceEndpoint
  }

  async start(service: IService, env: Env, runnerHash: string): Promise<boolean> {
    const labels = {
      'mesg.service': service.hash,
      'mesg.runner': runnerHash,
    }

    const image = await this.build(service)

    let serviceNetwork = await this.findNetwork(labels)
    if (!serviceNetwork) serviceNetwork = await this._client.network.create({
      name: PREFIX + service.hash,
      labels
    })

    const engineNetwork = await this.findNetwork({ 'mesg.engine': 'true' })
    if (!engineNetwork) throw new Error('engine network not found')

    for (const dep of service.dependencies || []) {
      const container = new Container({
        Args: dep.args,
        Command: dep.command,
        Env: dep.env,
        Image: dep.image,
        Labels: {
          ...labels,
          'mesg.dependency': dep.key,
        },
        HostConfig: {
          Mounts: this.convertVolumes(service, dep.volumes, dep.volumesFrom, dep),
          RestartPolicy: {
            Name: 'on-failure',
            MaximumRetryCount: MAX_RETRY
          }
        }
      }, PREFIX + service.hash + '_' + dep.key)
      container.addPorts(dep.ports)
      container.connectTo(serviceNetwork, [dep.key])
      await container.start()
    }
    const envObj: Env = {
      ...service.configuration.env.reduce((prev, x) => ({ ...prev, [x.split('=')[0]]: x.split('=')[1] }), {}),
      ...env,
      MESG_ENDPOINT: `${this.serviceEndpoint}:50052`
    }
    const container = new Container({
      Args: service.configuration.args,
      Command: service.configuration.command,
      Env: Object.keys(envObj).reduce((prev, x) => [...prev, `${x}=${envObj[x]}`], []),
      Image: image,
      Labels: {
        ...labels,
        'mesg.dependency': 'service'
      },
      HostConfig: {
        Mounts: this.convertVolumes(service, service.configuration.volumes, service.configuration.volumesFrom),
        RestartPolicy: {
          Name: 'on-failure',
          MaximumRetryCount: MAX_RETRY
        }
      }
    }, PREFIX + service.hash)
    container.addPorts(service.configuration.ports)
    container.connectTo(serviceNetwork, ['service'])
    container.connectTo(engineNetwork, ['engine'])
    await container.start()

    return true
  }

  async stop(runnerHash: string): Promise<void> {
    const runner = await this._api.runner.get(runnerHash)
    const instance = await this._api.instance.get(runner.instanceHash)
    const labels = {
      'mesg.service': instance.serviceHash,
      'mesg.runner': runner.hash,
    }
    const containers = await Container.findAll(this._client, labels)
    for (const container of containers) {
      await container.stop()
      await container.delete()
    }
    const serviceNetwork = await this.findNetwork(labels)
    if (serviceNetwork) await serviceNetwork.remove()
  }

  private async findNetwork(labels: Labels): Promise<Network> {
    const allLabels = (data: Labels) => Object.keys(labels)
      .reduce((prev, x) => prev && data[x] === labels[x], true)
    const list = await this._client.network.list()
    const items = (list as any[]).filter(x => allLabels((x.data as any)['Labels'] || {}))
    if (items.length > 1) throw new Error(`more than one network found`)
    return items[0]
  }

  private async build(service: IService) {
    const streamToPromise = (stream: any) => {
      let res: string = ''
      return new Promise((resolve, reject) => stream
        .on('error', reject)
        .on('data', (x: any) => res += x.toString())
        .on('end', () => {
          const logs = res.split('\n').map(x => {
            try {
              return JSON.parse(x)
            } catch (e) {
              return null
            }
          }).filter(x => x)
          const error = logs.find((x: any) => x.error)
          if (error) return reject(error.error)
          return resolve()
        })
      )
    }
    const resp = await fetch(`${this.ipfsGateway}/${service.source}`)
    const tag = `mesg:${service.hash}`
    const image: any = await this._client.image.build(resp.body as ReadStream, {
      t: tag,
      q: true
    })
    await streamToPromise(image)
    return tag
  }

  private convertVolumes(service: IService, volumes: string[], volumesFrom: string[], dependency?: ServiceType.mesg.types.Service.IDependency): any[] {
    const res = []
    for (const volume of volumes || []) {
      res.push({
        Source: this.volumeName(service, volume, dependency),
        Target: volume,
        Type: 'volume'
      })
    }

    // Add volumes from
    for (const dep of volumesFrom || []) {
      const dependency = (service.dependencies || []).find(x => x.key === dep)
      if (!dependency) throw new Error(`dependency "${dependency}" missing`)
      for (const volume of dependency.volumes) {
        res.push({
          Source: this.volumeName(service, volume, dependency),
          Target: volume,
          Type: 'volume'
        })
      }
    }
    return res
  }

  private volumeName(service: IService, vol: string, dependency?: ServiceType.mesg.types.Service.IDependency): string {
    return createHash('sha256')
      .update(JSON.stringify([
        service.hash,
        dependency ? dependency.key : null,
        vol
      ]))
      .digest('hex')
  }
}
