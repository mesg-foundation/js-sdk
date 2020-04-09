import LCDClient from './util/lcd'
import { IStruct } from './struct'

export enum Status {
  Unknown = 0,
  Created = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4
}

export type IExecution = {
  hash: string;
  parentHash?: string;
  eventHash?: string;
  status: Status;
  instanceHash: string;
  taskKey: string;
  inputs?: IStruct[];
  outputs?: IStruct[];
  error?: (string | null);
  tags?: (string[] | null);
  processHash?: (string | null);
  nodeKey?: (string | null);
  executorHash: string;
  price?: string;
  blockHeight?: number;
  emitters?: {
    runnerHash: string;
    blockHeight: number;
  }[];
  address?: string
}

export default class Execution extends LCDClient {

  async get(hash: string): Promise<IExecution> {
    return (await this.query(`/execution/get/${hash}`)).result
  }

  async list(): Promise<IExecution[]> {
    return (await this.query(`/execution/list`)).result || []
  }
}