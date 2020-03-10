import LCDClient from './util/lcd'

export type IInstance = {
  hash: string;
  serviceHash: string;
  envHash: string;
}

export default class Instance extends LCDClient {

  async get(hash: string): Promise<IInstance> {
    return (await this.query(`/instance/get/${hash}`)).result
  }

  async list(filter?: { serviceHash?: string }): Promise<IInstance[]> {
    return (await this.query(`/instance/list`, filter)).result || []
  }
}