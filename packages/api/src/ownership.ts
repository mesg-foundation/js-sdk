import LCDClient from './util/lcd'

export enum Resource {
  None = 0,
  Service = 1,
  Process = 2,
  Runner = 3,
}

export type IOwnership = {
  hash: string;
  owner: string;
  resourceHash: string;
  resource: Resource;
  resourceAddress: string;
}

export default class Ownership extends LCDClient {
  
  async list(): Promise<IOwnership[]> {
    return (await this.query(`/ownership/list`)).result || []
  }
}