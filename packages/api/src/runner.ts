import LCDClient from './util/lcdClient'
import { IMsg } from './transaction'
import { createHash } from 'crypto'
import { encode } from './util/base58'

export type IRunner = {
  hash: string;
  address: string;
  instanceHash?: string | null;
}

export type IMsgCreate = {
  address: string,
  serviceHash: string,
  envHash?: string
}

export type IMsgDelete = {
  address: string,
  runnerHash: string
}

export default class Runner extends LCDClient {

  createMsg(address: string, serviceHash: string, env: { [key: string]: string } = {}): IMsg<IMsgCreate> {
    // TODO: proper hash calculation
    const envStr = '[]'
    const envHash = encode(createHash('sha256')
      .update(envStr)
      .digest())
    return {
      type: 'runner/CreateRunner',
      value: {
        address,
        serviceHash,
        envHash
      }
    }
  }

  deleteMsg(address: string, runnerHash: string): IMsg<IMsgDelete> {
    return {
      type: 'runner/DeleteRunner',
      value: {
        address,
        runnerHash
      }
    }
  }

  async get(hash: string): Promise<IRunner> {
    return (await this.query(`/runner/get/${hash}`)).result
  }

  async list(filter?: { instanceHash?: string | null, address?: string | null }): Promise<IRunner[]> {
    return (await this.query('/runner/list', filter)).result || []
  }
}