import { Docker } from "node-docker-api"
import fetch from 'node-fetch'
import { ReadStream } from 'fs'
import API from '@mesg/api/lib/lcd'
import * as ServiceType from '@mesg/api/lib/typedef/service';
import { IService } from "@mesg/api/lib/service-lcd"
import { IRunner } from '@mesg/api/lib/runner-lcd'
import { findHash } from "@mesg/api/lib/util/txevent"
import { Provider } from '../../index'
import { Network } from "node-docker-api/lib/network"
import Container from './container'
import { createHash } from 'crypto'
import { IAccount } from "@mesg/api/lib/account-lcd";

const debug = require('debug')('runner')

const ENGINE_NETWORK_NAME = 'engine'
const PREFIX = 'mesg_srv_'

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
    const account = await this._api.account.import(this._mnemonic)
    const { runnerHash, instanceHash, envHash } = await this._api.runner.hash(account.address, service.hash, env)
    debug('broadcast tx')

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
          Mounts: this.convertVolumes(service, dep.volumes, dep.volumesFrom, dep)
        }
      }, PREFIX + service.hash + dep.key)
      container.addPorts(dep.ports)
      container.connectTo(serviceNetwork, ['service'])
      await container.start()
    }
    const container = new Container({
      Args: service.configuration.args,
      Command: service.configuration.command,
      Env: [
        ...this.mergeEnv([
          ...service.configuration.env || [],
          ...env || []
        ]),
        `MESG_INSTANCE_HASH=${instanceHash}`,
        `MESG_RUNNER_HASH=${runnerHash}`,
        `MESG_ENDPOINT=${this.serviceEndpoint}:50052`
      ],
      Image: image,
      Labels: {
        ...labels,
        'mesg.dependency': 'service'
      },
      HostConfig: {
        Mounts: this.convertVolumes(service, service.configuration.volumes, service.configuration.volumesFrom)
      }
    }, PREFIX + service.hash)
    container.addPorts(service.configuration.ports)
    container.connectTo(serviceNetwork, ['service'])
    container.connectTo(engineNetwork, ['engine'])
    await container.start()

    return this.createRunnerTx(account, service, envHash)
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
    const containers = await Container.findAll(this._client, labels)
    for (const container of containers) {
      await container.stop()
      await container.delete()
    }
    const serviceNetwork = await this.findNetwork(labels)
    if (serviceNetwork) await serviceNetwork.remove()
  }

  private async createRunnerTx(account: IAccount, service: IService, envHash: string): Promise<IRunner> {
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

  private async findNetwork(labels: Labels): Promise<Network> {
    const allLabels = (data: Labels) => Object.keys(labels)
      .reduce((prev, x) => prev && data[x] === labels[x], true)
    const list = await this._client.network.list()
    const items = (list as any[]).filter(x => allLabels((x.data as any)['Labels'] || {}))
    if (items.length > 1) throw new Error(`more than one network found`)
    return items[0]
  }

  private async build(service: IService) {
    const streamToPromise = (stream: any) => new Promise((resolve, reject) => stream
      .on('data', (x: any) => x.toString()) // For some reason we need to listen to the data to have the end event
      .on('error', reject)
      .on('end', resolve))
    const resp = await fetch(`${this.ipfsGateway}/${service.source}`)
    const tag = `mesg:${service.hash}`
    const image: any = await this._client.image.build(resp.body as ReadStream, {
      t: tag,
      q: true
    })
    await streamToPromise(image)
    return tag
  }

  private mergeEnv(envs: string[]): string[] {
    const res: { [key: string]: string } = {}
    for (const e of envs) {
      const [key, value] = e.split('=')
      res[key] = value
    }
    return Object.keys(res).map(x => `${x}=${res[x]}`)
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