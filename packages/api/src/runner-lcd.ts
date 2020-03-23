import LCDClient from './util/lcd'
import { IMsg } from './transaction'

export type IRunner = {
  hash: string;
  address: string;
  instanceHash?: string | null;
}

export type IMsgCreate = {
  address: string;
  serviceHash: string;
  envHash: string;
}

export type IMsgDelete = {
  address: string;
  runnerHash: string;
}

export default class Runner extends LCDClient {

  createMsg(owner: string, serviceHash: string, envHash: string): IMsg<IMsgCreate> {
    return {
      type: 'runner/CreateRunner',
      value: {
        address: owner,
        serviceHash: serviceHash,
        envHash: envHash
      }
    }
  }

  deleteMsg(owner: string, runnerHash: string): IMsg<IMsgDelete> {
    return {
      type: 'runner/DeleteRunner',
      value: {
        address: owner,
        runnerHash: runnerHash
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
}