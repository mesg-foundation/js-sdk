import API from '@mesg/api'
import * as base58 from '@mesg/api/lib/util/base58'
import { IRunner } from '@mesg/api/lib/runner-lcd'
import { Provider } from '../../index'

export default class GRPC implements Provider {

  private _api: API

  constructor(endpoint: string) {
    this._api = new API(endpoint)
  }

  async start(serviceHash: string, env: { [key: string]: string }): Promise<IRunner> {
    const response = await this._api.runner.create({
      serviceHash: base58.decode(serviceHash),
      env: Object.keys(env).reduce((prev, x) => [...prev, `${x}=${env[x].toString()}`], [])
    })

    const runner = await this._api.runner.get({ hash: response.hash })
    return {
      address: runner.address,
      hash: base58.encode(runner.hash),
      instanceHash: base58.encode(runner.instanceHash)
    }
  }

  async stop(runnerHash: string): Promise<void> {
    await this._api.runner.delete({
      hash: base58.decode(runnerHash)
    })
  }
}