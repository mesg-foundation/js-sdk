import { Docker } from "node-docker-api"
import fetch from 'node-fetch'
import { ReadStream } from 'fs'
import API from '@mesg/api/lib/lcd'
import { IService } from "@mesg/api/lib/service-lcd"
import { IRunner } from '@mesg/api/lib/runner-lcd'
import { findHash } from "@mesg/api/lib/util/txevent"
import { Provider } from '../../index'
import { Container } from "node-docker-api/lib/container"
import { Network } from "node-docker-api/lib/network"

const ENGINE_NETWORK_NAME = 'engine'

export default class DockerContainer implements Provider {

  private _api: API
  private _client: Docker
  private _mnemonic: string
  private ipfsGateway = "http://ipfs.app.mesg.com:8080/ipfs"

  constructor(endpoint: string, mnemonic: string) {
    this._api = new API(endpoint)
    this._client = new Docker(null)
    this._mnemonic = mnemonic
  }

  async start(serviceHash: string, env: string[]): Promise<IRunner> {
    const service = await this._api.service.get(serviceHash)
    const image = await this.build(service)
    const runner = await this.createRunnerTx(service, env)
    const serviceContainer = await this.createServiceContainer(service, runner, image, env)

    const engineNetwork = await this.getNetwork(ENGINE_NETWORK_NAME)
    await engineNetwork.connect({ container: serviceContainer.id })

    const dependencyContainers = await this.createDependenciesContainer(service, runner)
    const serviceNetwork = await this.getServiceNetwork(service)

    const containers = [...dependencyContainers, serviceContainer]
    try {
      for (const container of containers) {
        await serviceNetwork.connect({ container: container.id })
        await container.start()
      }
    } catch (e) {
      await this.stop(runner.hash)
    }

    return runner
  }

  async stop(runnerHash: string): Promise<void> {
    const account = await this._api.account.import(this._mnemonic)
    const tx = await this._api.createTransaction(
      [this._api.runner.deleteMsg(account.address, runnerHash)],
      account
    )
    await this._api.broadcast(tx.signWithMnemonic(this._mnemonic), "block")
  }

  private async build(service: IService): Promise<string> {
    const resp = await fetch(`${this.ipfsGateway}/${service.source}`)
    const tag = `mesg:${service.hash}`
    const image: any = await this._client.image.build(resp.body as ReadStream, {
      t: tag,
      q: true
    })
    await new Promise((resolve, reject) => image
      .on('error', reject)
      .on('data', (x: any) => resolve(JSON.parse(x.toString())))
    )
    return tag
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

  private async getNetwork(name: string): Promise<Network> {
    const networks = await this._client.network.list({
      filters: { name: [name] }
    })
    return networks.filter(x => (x.data as any)['Name'] === name)[0]
  }

  private async getServiceNetwork(service: IService): Promise<Network> {
    const network = await this.getNetwork(service.hash)
    if (network) return network
    const res = await this._client.network.create({ name: service.hash, checkDuplicate: true })
    return this._client.network.get(res.id)
  }

  private async createServiceContainer(service: IService, runner: IRunner, image: string, env: string[]): Promise<Container> {
    const resp = await this._client.container.create({
      name: service.hash,
      image: image,
      env: [
        ...this.mergeEnv([...(service.configuration.env || []), ...env]),
        `MESG_INSTANCE_HASH=${runner.instanceHash}`,
        `MESG_RUNNER_HASH=${runner.hash}`,
        `MESG_ENDPOINT=${ENGINE_NETWORK_NAME}:50052`
      ],
      command: service.configuration.command,
      args: service.configuration.args,
      // TODO
      // ports: service.configuration.ports,
      // volumes: [service.configuration.volumes, service.configuration.volumesFrom],
      labels: {
        'mesg.service': service.hash,
        'mesg.runner': runner.hash
      }
    })
    return this._client.container.get(resp.id)
  }

  private async createDependenciesContainer(service: IService, runner: IRunner): Promise<Container[]> {
    const containers = []
    for (const dep of service.dependencies || []) {
      const resp = await this._client.container.create({
        name: `${service.hash}-${dep.key}`,
        image: dep.image,
        env: dep.env,
        command: dep.command,
        args: dep.args,
        // ports: dep.ports,
        // volumes: [dep.volumes, dep.volumesFrom],
        labels: {
          'mesg.service': service.hash,
          'mesg.runner': runner.hash,
          'mesg.dependency': dep.key,
        }
      })
      containers.push(await this._client.container.get(resp.id))
    }
    return containers
  }

  private mergeEnv(envs: string[]): string[] {
    const res: { [key: string]: string } = {}
    for (const e in envs) {
      const [key, value] = e.split('=')
      res[key] = value
    }
    return Object.keys(res).map(x => `${x}=${res[x]}`)
  }
}