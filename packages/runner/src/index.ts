import { IRunner } from '@mesg/api/lib/runner-lcd'

export interface Provider {
  start(serviceHash: string, env: { [key: string]: string }): Promise<IRunner>
  stop(runnerHash: string): Promise<void>
}

export default class Runner {

  private _serviceHash: string
  private _provider: Provider

  constructor(serviceHash: string, provider: Provider) {
    this._serviceHash = serviceHash
    this._provider = provider
  }

  async start(env: { [key: string]: string }): Promise<IRunner> {
    return this._provider.start(this._serviceHash, env)
  }

  async stop(runnerHash: string): Promise<void> {
    this._provider.stop(runnerHash)
  }
}
