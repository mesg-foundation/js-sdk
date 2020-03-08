import LCDClient from './util/lcd'

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
  inputs?: any;
  outputs?: any;
  error?: (string | null);
  tags?: (string[] | null);
  processHash?: (string | null);
  nodeKey?: (string | null);
  executorHash: string;
}

export default class Execution extends LCDClient {

  async get(hash: string): Promise<IExecution> { 
    return (await this.query(`/execution/get/${hash}`)).result
  }

  async list(): Promise<IExecution[]> {
    return (await this.query(`/execution/list`)).result
  }
}