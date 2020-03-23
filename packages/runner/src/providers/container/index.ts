import { Docker } from "node-docker-api"
import fetch from 'node-fetch'
import { ReadStream } from 'fs'
import API from '@mesg/api/lib/lcd'
import * as ServiceType from '@mesg/api/lib/typedef/service';
import { IService } from "@mesg/api/lib/service-lcd"
import { IRunner } from '@mesg/api/lib/runner-lcd'
import { findHash } from "@mesg/api/lib/util/txevent"
import { Provider } from '../../index'
import { Container } from "node-docker-api/lib/container"
import { Network } from "node-docker-api/lib/network"
import { Volume } from "node-docker-api/lib/volume";
import { createHash } from 'crypto'

const debug = require('debug')('runner')

const ENGINE_NETWORK_NAME = 'engine'

type Labels = { [key: string]: string }

export default class DockerContainer implements Provider {

  private _api: API
  private _client: Docker
  private _mnemonic: string
  private ipfsGateway = "http://ipfs.app.mesg.com:8080/ipfs"
  private serviceEndpoint: string

  constructor(endpoint: string, mnemonic: string, serviceEndpoint: string = ENGINE_NETWORK_NAME) {
    this._api = new API(endpoint)
    this._client = new Docker(null)
    this._mnemonic = mnemonic
    this.serviceEndpoint = serviceEndpoint
  }

  async start(serviceHash: string, env: string[]): Promise<IRunner> {

    debug('fetch service')
    const service = await this._api.service.get(serviceHash)
    debug('broadcast tx')
    const runner = await this.createRunnerTx(service, env)

    const labels = {
      'mesg.service': service.hash,
      'mesg.runner': runner.hash,
    }

    debug('setup networks')
    await this.setupNetworks(service, runner, labels)
    debug('setup images')
    await this.fetchImages(service)
    debug('setup containers')
    await this.setupContainers(service, runner, env, labels)

    const serviceNetwork = (await this.find('network', labels) as Network)
    if (!serviceNetwork) throw new Error('service network not found')

    for (const dep of service.dependencies || []) {
      const container = await this.find('container', { ...labels, 'mesg.dependency': dep.key }) as Container
      if (!container) throw new Error('container missing')
      if (!(await serviceNetwork.status() as any).data.Containers[container.id]) {
        debug(`connect ${dep.key} to service network`)
        await serviceNetwork.connect({ container: container.id })
      }
      debug(`start ${dep.key}`)
      await container.start()
    }
    const container = await this.find('container', { ...labels, 'mesg.dependency': 'service' }) as Container
    if (!container) throw new Error('container missing')
    if (!(await serviceNetwork.status() as any).data.Containers[container.id]) {
      debug(`connect service to service network`)
      await serviceNetwork.connect({ container: container.id })
    }
    if (this.serviceEndpoint === ENGINE_NETWORK_NAME) {
      const engineNetwork = (await this.find('network', { 'mesg.engine': 'true' }) as Network)
      if (!engineNetwork) throw new Error('engine network not found')
      if (!(await engineNetwork.status() as any).data.Containers[container.id]) {
        debug(`connect service to engine network`)
        await engineNetwork.connect({ container: container.id })
      }
    }
    debug(`start service`)
    await container.start()

    return runner
  }

  async stop(runnerHash: string): Promise<void> {
    const runner = await this._api.runner.get(runnerHash)
    const instance = await this._api.instance.get(runner.instanceHash)
    const account = await this._api.account.import(this._mnemonic)
    const tx = await this._api.createTransaction(
      [this._api.runner.deleteMsg(account.address, runnerHash)],
      account
    )
    await this._api.broadcast(tx.signWithMnemonic(this._mnemonic), "block")

    const labels = {
      'mesg.service': instance.serviceHash,
      'mesg.runner': runner.hash,
    }
    const containers = await this.findAll('container', labels) as Container[]
    for (const container of containers) {
      await container.stop()
      await container.delete()
    }
  }

  private async createRunnerTx(service: IService, env: string[]): Promise<IRunner> {
    const envHash = service.hash // HACK TO REMOVE
    const account = await this._api.account.import(this._mnemonic)
    let runnerHash: string
    try {
      const tx = await this._api.createTransaction(
        [this._api.runner.createMsg(account.address, service.hash, envHash)],
        account
      )
      const res = await this._api.broadcast(tx.signWithMnemonic(this._mnemonic), "block")
      const hashes = findHash(res, "Runner")
      if (hashes.length !== 1) throw new Error('cannot find runner hash')
      runnerHash = hashes[0]
    } catch (error) {
      const regexp = new RegExp('\"(.*)\" already exists')
      if (!regexp.test(error.message)) throw error
      const res = regexp.exec(error.message)
      runnerHash = res && res.length >= 1 ? res[1] : ''
    }

    return this._api.runner.get(runnerHash)
  }

  private async setupNetworks(service: IService, runner: IRunner, labels: Labels) {
    if (await this.find('network', labels)) return
    debug(`create network ${service.hash}`)
    await this._client.network.create({ name: service.hash, labels })
  }

  private async setupContainers(service: IService, runner: IRunner, env: string[], labels: Labels) {
    for (const dependency of service.dependencies || []) {
      const depLabels = { ...labels, 'mesg.dependency': dependency.key }
      if (await this.find('container', depLabels)) continue
      debug(`create container dep ${dependency.key}`)
      await this._client.container.create({
        image: dependency.image,
        env: dependency.env,
        command: dependency.command,
        args: dependency.args,
        mounts: await this.prepareVolumes(service, dependency.volumes, dependency.volumesFrom, dependency),
        labels: depLabels,
        ...this.preparePorts(dependency.ports)
      })
    }
    const srvLabels = { ...labels, 'mesg.dependency': 'service' }
    if (await this.find('container', srvLabels)) return
    debug('create container service', service.configuration.ports.reduce((prev, x) => ({ ...prev, [`${x}/tcp`]: {} }), {}))
    await this._client.container.create({
      image: `mesg:${service.hash}`,
      env: [
        ...this.mergeEnv([...(service.configuration.env || []), ...env]),
        `MESG_INSTANCE_HASH=${runner.instanceHash}`,
        `MESG_RUNNER_HASH=${runner.hash}`,
        `MESG_ENDPOINT=${this.serviceEndpoint}:50052`
      ],
      command: service.configuration.command,
      args: service.configuration.args,
      mounts: await this.prepareVolumes(service, service.configuration.volumes, service.configuration.volumesFrom),
      labels: srvLabels,
      ...this.preparePorts(service.configuration.ports)
    })
  }

  private async findAll(resource: 'volume' | 'container' | 'network', labels: Labels): Promise<Volume[] | Container[] | Network[]> {
    const allLabels = (data: Labels) => Object.keys(labels)
      .reduce((prev, x) => prev && data[x] === labels[x], true)
    const list = await this._client[resource].list({ all: true })
    return (list as any[]).filter(x => allLabels((x.data as any)['Labels'] || {}))
  }

  private async find(resource: 'volume' | 'container' | 'network', labels: Labels): Promise<Volume | Container | Network> {
    const items = await this.findAll(resource, labels)
    if (items.length > 1) throw new Error(`more than one ${resource} found`)
    return items[0]
  }

  private async fetchImages(service: IService) {
    const streamToPromise = (stream: any) => new Promise((resolve, reject) => stream
      .on('data', (x: any) => x.toString()) // For some reason we need to listen to the data to have the end event
      .on('error', reject)
      .on('end', resolve))

    for (const dependency of service.dependencies || []) {
      const [fromImage, tag] = dependency.image.split(':')
      const stream = await this._client.image.create({}, {
        fromImage,
        tag: tag || 'latest'
      })
      await streamToPromise(stream)
    }
    const resp = await fetch(`${this.ipfsGateway}/${service.source}`)
    const tag = `mesg:${service.hash}`
    const image: any = await this._client.image.build(resp.body as ReadStream, {
      t: tag,
      q: true
    })
    return streamToPromise(image)
  }

  private async prepareVolumes(service: IService, volumes: string[], volumesFrom: string[], dependency?: ServiceType.mesg.types.Service.IDependency): Promise<{ Source: string, Target: string, Type: string }[]> {
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

  // https://stackoverflow.com/questions/20428302/binding-a-port-to-a-host-interface-using-the-rest-api/20429133
  private preparePorts(ports: string[]): Object {
    return {
      exposedPorts: ports.reduce((prev, x) => ({
        ...prev,
        [`${x}/tcp`]: {}
      }), {}),
      hostConfig: {
        portBindings: ports.reduce((prev, x) => ({
          ...prev,
          [`${x}/tcp`]: [{ hostPort: x }]
        }), {})
      }
    }
  }

  private mergeEnv(envs: string[]): string[] {
    const res: { [key: string]: string } = {}
    for (const e of envs) {
      const [key, value] = e.split('=')
      res[key] = value
    }
    return Object.keys(res).map(x => `${x}=${res[x]}`)
  }
}