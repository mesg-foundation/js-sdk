import { IRunner } from '@mesg/api/lib/runner-lcd'

export interface Provider {
  start(serviceHash: string, env: string[]): Promise<IRunner>
  stop(runnerHash: string): Promise<void>
}

export default class Runner {

  private _provider: Provider

  constructor(provider: Provider) {
    this._provider = provider
  }

  async start(serviceHash: string, env: string[]): Promise<IRunner> {
    return this._provider.start(serviceHash, env)
  }

  async stop(runnerHash: string): Promise<void> {
    await this._provider.stop(runnerHash)
  }
}
