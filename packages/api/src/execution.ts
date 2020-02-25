import { createClient, promisify, Stream } from './util/grpc'
import { mesg } from './typedef/execution'
import LCDClient from './util/lcdClient'
import { IMsg } from './transaction'
import { encode } from './util/encoder'

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
  inputs?: (mesg.protobuf.IStruct | null);
  outputs?: (mesg.protobuf.IStruct | null);
  error?: (string | null);
  tags?: (string[] | null);
  processHash?: (string | null);
  nodeKey?: (string | null);
  executorHash: string;
}

export type IMsgCreate = {
  signer: string
  request: {
    taskKey: string;
    inputs: mesg.protobuf.IStruct;
    tags: string[];
    parentHash?: string;
    eventHash?: string;
    processHash?: string;
    nodeKey?: string;
    executorHash: string
  }
}

export type IMsgUpdate = {
  executor: string
  request: {
    hash: string;
    outputs: mesg.protobuf.IStruct;
    error: string;
  }
}

export default class Execution extends LCDClient {

  private _client: any

  constructor(grpcEndpoint: string, lcdEndpoint: string) {
    super(lcdEndpoint)
    this._client = createClient('Execution', './protobuf/api/execution.proto', grpcEndpoint)
  }

  async create(request: mesg.api.ICreateExecutionRequest): Promise<mesg.api.ICreateExecutionResponse> {
    return promisify(this._client, 'Create')(request)
  }

  createMsg(
    signer: string,
    executorHash: string,
    taskKey: string,
    inputs: object,
    parentHash?: string,
    eventHash?: string,
    nodeKey?: string,
    processHash?: string,
    tags?: string[],
  ): IMsg<IMsgCreate> {
    const value: IMsgCreate = {
      signer,
      request: {
        executorHash,
        taskKey,
        inputs: encode(inputs),
        tags,
      }
    }
    if (parentHash) value.request.parentHash = parentHash
    if (eventHash) value.request.eventHash = eventHash
    if (nodeKey) value.request.nodeKey = nodeKey
    if (processHash) value.request.processHash = processHash
    return {
      type: 'execution/CreateExecution',
      value
    }
  }

  async update(request: mesg.api.IUpdateExecutionRequest): Promise<mesg.api.IUpdateExecutionResponse> {
    return promisify(this._client, 'Update')(request)
  }

  updateMsg(hash: string, executor: string, outputs?: object, error?: Error): IMsg<IMsgUpdate> {
    return {
      type: 'execution/UpdateExecution',
      value: {
        executor,
        request: {
          hash,
          outputs: encode(outputs),
          error: error.message
        }
      }
    }
  }

  async get(hash: string): Promise<IExecution> {
    return (await this.query(`/execution/get/${hash}`)).result
  }

  async list(): Promise<IExecution[]> {
    return (await this.query(`/execution/list`)).result
  }

  stream(request: mesg.api.IStreamExecutionRequest): Stream<IExecution> {
    return this._client.Stream(request)
  }
}