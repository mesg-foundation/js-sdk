import * as grpc from 'grpc'
import * as base58 from '@mesg/api/lib/util/base58'
import * as encoder from '@mesg/api/lib/util/encoder'
import { Client } from './client'
import * as Type from './typedef/execution'
import * as API from './api/execution'

// TODO: To improve using the types but if include the type, the definition is still included in the js
export const Status: { [key: string]: Type.mesg.types.Status } = {
  Unknown: 0, // Type.mesg.types.Status.Unknown,
  Proposed: 1, // Type.mesg.types.Status.Proposed,
  InProgress: 2, // Type.mesg.types.Status.InProgress,
  Completed: 3, // Type.mesg.types.Status.Completed,
  Failed: 4, // Type.mesg.types.Status.Failed
}

export type CreateRequest = {
  executorHash: string;
  taskKey: string;
  inputs: Object;
  tags?: string[];
  price?: string;
}

export type StreamRequest = {
  filter: {
    statuses?: Type.mesg.types.Status[]
    instanceHash?: string
    taskKey?: string
    tags?: string[]
    executorHash?: string
  }
}

export default class Execution extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Execution')
  }

  public async create(request: CreateRequest, signature: string): Promise<API.mesg.grpc.orchestrator.IExecutionCreateResponse> {
    const gprcReq: API.mesg.grpc.orchestrator.IExecutionCreateRequest = {
      executorHash: base58.decode(request.executorHash),
      inputs: encoder.encode(request.inputs),
      price: request.price,
      tags: request.tags,
      taskKey: request.taskKey
    }
    return this.unaryCall("Create", gprcReq, signature)
  }

  public stream(request: StreamRequest, signature: string): grpc.ClientReadableStream<Type.mesg.types.IExecution> {
    const grpcReq: API.mesg.grpc.orchestrator.IExecutionStreamRequest = {
      filter: {
        executorHash: request.filter.executorHash ? base58.decode(request.filter.executorHash) : null,
        instanceHash: request.filter.instanceHash ? base58.decode(request.filter.instanceHash) : null,
        statuses: request.filter.statuses,
        tags: request.filter.tags,
        taskKey: request.filter.taskKey
      }
    }
    return this.streamCall('Stream', grpcReq, signature)
  }
}
