import LCDClient from './util/lcd'
import { IMsg } from './transaction'

export type IRunner = {
  hash: string;
  owner: string;
  instanceHash: string | null;
  address: string | null;
}

export type IMsgCreate = {
  owner: string;
  serviceHash: string;
  envHash: string;
}

export type IMsgDelete = {
  owner: string;
  hash: string;
}

export default class Runner extends LCDClient {

  createMsg(owner: string, serviceHash: string, envHash: string): IMsg<IMsgCreate> {
    return {
      type: 'runner/create',
      value: {
        owner,
        serviceHash,
        envHash
      }
    }
  }

  deleteMsg(owner: string, hash: string): IMsg<IMsgDelete> {
    return {
      type: 'runner/delete',
      value: {
        owner,
        hash
      }
    }
  }

  async get(hash: string): Promise<IRunner> {
    return (await this.query(`/runner/get/${hash}`)).result
  }

  async list(filter?: { instanceHash?: string | null, address?: string | null }): Promise<IRunner[]> {
    let runners: IRunner[] = (await this.query('/runner/list')).result || []
    if (filter && filter.instanceHash) runners = runners.filter(x => x.instanceHash === filter.instanceHash)
    if (filter && filter.address) runners = runners.filter(x => x.address === filter.address)
    return runners
  }

  async hash(owner: string, serviceHash: string, env: string[]): Promise<{
    runnerHash: string,
    instanceHash: string,
    envHash: string
  }> {
    return (await this.query('/runner/hash', {
      serviceHash,
      env,
      address: owner,
    }, 'POST')).result
  }
}