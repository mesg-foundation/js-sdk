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
    return (await this.query('/runner/list', filter)).result || []
  }
}