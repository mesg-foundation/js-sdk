import API from '@mesg/api/lib/lcd'
import Orchestrator from '@mesg/orchestrator'
import Account from "@mesg/api/lib/account-lcd"
import sortObject from '@mesg/api/lib/util/sort-object'
import { IService } from '@mesg/api/lib/service-lcd'
import Transaction from '@mesg/api/lib/transaction'

export type RunnerInfo = {
  hash: string
  instanceHash: string
}

export type Env = { [key: string]: string }

export interface Provider {
  start(service: IService, env: Env, runnerHash: string): Promise<boolean>
  stop(runnerHash: string): Promise<void>
}

export default class Runner {

  private _provider: Provider
  private _api: API
  private _orchestrator: Orchestrator
  private _mnemonic: string
  private _engineAddress: string

  constructor(provider: Provider, lcdEndpoint: string, orchestratorEndpoint: string, mnemonic: string, engineAddress: string) {
    this._api = new API(lcdEndpoint)
    this._orchestrator = new Orchestrator(orchestratorEndpoint)
    this._provider = provider
    this._mnemonic = mnemonic
    this._engineAddress = engineAddress
  }

  async start(serviceHash: string, env: string[]): Promise<RunnerInfo> {
    const service = await this._api.service.get(serviceHash)
    const { runnerHash, instanceHash, envHash } = await this._api.runner.hash(this._engineAddress, serviceHash, env)
    const envObj = (env || []).reduce((prev, x) => ({ ...prev, [x.split('=')[0]]: x.split('=')[1] }), {})
    await this._provider.start(service, {
      ...envObj,
      MESG_ENDPOINT: `engine:50052`,
      MESG_SERVICE_HASH: service.hash,
      MESG_ENV_HASH: envHash,
      MESG_REGISTER_SIGNATURE: this.sign({
        serviceHash: serviceHash,
        envHash: envHash
      })
    }, runnerHash)
    return {
      instanceHash,
      hash: runnerHash
    }
  }

  async stop(runnerHash: string): Promise<void> {
    const payload = { runnerHash }
    await this._orchestrator.runner.delete(payload, this.sign(payload))
    await this._provider.stop(runnerHash)
  }

  private sign(data: Object): string {
    const ecdsa = Transaction.sign(JSON.stringify(sortObject(data)), Account.getPrivateKey(this._mnemonic))
    return Buffer.from(ecdsa.signature).toString('base64')
  }
}
