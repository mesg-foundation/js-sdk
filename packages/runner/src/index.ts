export type RunnerInfo = {
  hash: string
  instanceHash: string
}

export interface Provider {
  start(serviceHash: string, env: string[]): Promise<RunnerInfo>
  stop(runnerHash: string): Promise<void>
}

export default class Runner {

  private _provider: Provider

  constructor(provider: Provider) {
    this._provider = provider
  }

  async start(serviceHash: string, env: string[]): Promise<RunnerInfo> {
    return this._provider.start(serviceHash, env)
  }

  async stop(runnerHash: string): Promise<void> {
    await this._provider.stop(runnerHash)
  }
}
