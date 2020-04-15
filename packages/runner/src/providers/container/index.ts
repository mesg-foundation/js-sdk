import { Docker } from "node-docker-api"
import fetch from 'node-fetch'
import { ReadStream } from 'fs'
import { IService, IDependency } from "@mesg/api/lib/service"
import { Provider, Env } from '../../index'
import { Network } from "node-docker-api/lib/network"
import Container from './container'
import { createHash } from 'crypto'

const ENGINE_NETWORK_NAME = 'engine'
const PREFIX = 'mesg_srv_'
const MAX_RETRY = 5

type Labels = { [key: string]: string }

type DockerOptions = {
  socketPath?: string
  host?: string
  port?: string
  version?: string
  key?: string
  cert?: string
  ca?: string
  timeout?: string
  protocol?: string
}

export default class DockerContainer implements Provider {

  private _client: Docker
  private ipfsGateway = "http://ipfs.app.mesg.com:8080/ipfs"
  private serviceEndpoint: string

  constructor(opts: DockerOptions = null, serviceEndpoint: string = ENGINE_NETWORK_NAME) {
    this._client = new Docker(opts)
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
      name: PREFIX + runnerHash,
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
          Mounts: this.convertVolumes(service, runnerHash, dep.volumes, dep.volumesFrom, dep),
          RestartPolicy: {
            Name: 'on-failure',
            MaximumRetryCount: MAX_RETRY
          }
        }
      }, PREFIX + runnerHash + '_' + dep.key, this._client)
      container.addPorts(dep.ports)
      container.connectTo(serviceNetwork, [dep.key])
      await container.start()
    }
    const envObj: Env = {
      ...(service.configuration.env || []).reduce((prev, x) => ({ ...prev, [x.split('=')[0]]: x.split('=')[1] }), {}),
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
        Mounts: this.convertVolumes(service, runnerHash, service.configuration.volumes, service.configuration.volumesFrom),
        RestartPolicy: {
          Name: 'on-failure',
          MaximumRetryCount: MAX_RETRY
        }
      }
    }, PREFIX + runnerHash, this._client)
    container.addPorts(service.configuration.ports)
    container.connectTo(serviceNetwork, ['service'])
    container.connectTo(engineNetwork, [])
    await container.start()

    return true
  }

  async stop(runnerHash: string, serviceHash: string): Promise<void> {
    const labels = {
      'mesg.service': serviceHash,
      'mesg.runner': runnerHash,
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

  private convertVolumes(service: IService, runnerHash: string, volumes: string[], volumesFrom: string[], dependency?: IDependency): any[] {
    const res = []
    for (const volume of volumes || []) {
      res.push({
        Source: this.volumeName(runnerHash, volume, dependency),
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
          Source: this.volumeName(runnerHash, volume, dependency),
          Target: volume,
          Type: 'volume'
        })
      }
    }
    return res
  }

  private volumeName(runnerHash: string, vol: string, dependency?: IDependency): string {
    return createHash('sha256')
      .update(JSON.stringify([
        runnerHash,
        dependency ? dependency.key : null,
        vol
      ]))
      .digest('hex')
  }
}
