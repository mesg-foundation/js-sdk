import LCDClient from './util/lcd'

export type IRunner = {
  hash: string;
  address: string;
  instanceHash?: string | null;
}

export default class Runner extends LCDClient {
  async get(hash: string): Promise<IRunner> {
    return (await this.query(`/runner/get/${hash}`)).result
  }

  async list(filter?: { instanceHash?: string | null, address?: string | null }): Promise<IRunner[]> {
    let runners: IRunner[] = (await this.query('/runner/list')).result || []
    if (filter && filter.instanceHash) runners = runners.filter(x => x.instanceHash === filter.instanceHash)
    if (filter && filter.address) runners = runners.filter(x => x.address === filter.address)
    return runners
  }
}