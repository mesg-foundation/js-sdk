import API from '@mesg/api/lib/lcd'
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
  private _mnemonic: string
  private _engineAddress: string

  constructor(provider: Provider, endpoint: string, mnemonic: string, engineAddress: string) {
    this._api = new API(endpoint)
    this._provider = provider
    this._mnemonic = mnemonic
    this._engineAddress = engineAddress
  }

  async start(serviceHash: string, env: string[]): Promise<RunnerInfo> {
    const service = await this._api.service.get(serviceHash)
    const { runnerHash, instanceHash, envHash } = await this._api.runner.hash(this._engineAddress, serviceHash, env)
    const signature = this.sign(serviceHash, envHash)
    const envObj = (env || []).reduce((prev, x) => ({ ...prev, [x.split('=')[0]]: x.split('=')[1] }), {})
    await this._provider.start(service, {
      ...envObj,
      MESG_ENDPOINT: `engine:50052`,
      MESG_SERVICE_HASH: service.hash,
      MESG_ENV_HASH: envHash,
      MESG_REGISTER_SIGNATURE: signature
    }, runnerHash)
    return {
      instanceHash,
      hash: runnerHash
    }
  }

  async stop(runnerHash: string): Promise<void> {
    const account = await this._api.account.import(this._mnemonic)
    const tx = await this._api.createTransaction(
      [this._api.runner.deleteMsg(account.address, runnerHash)],
      account
    )
    await this._api.broadcast(tx.signWithMnemonic(this._mnemonic), "block")
    await this._provider.stop(runnerHash)
  }

  private sign(serviceHash: string, envHash: string): string {
    const value = {
      serviceHash: serviceHash,
      envHash: envHash
    }
    const ecdsa = Transaction.sign(JSON.stringify(sortObject(value)), Account.getPrivateKey(this._mnemonic))
    return Buffer.from(ecdsa.signature).toString('base64')
  }
}
