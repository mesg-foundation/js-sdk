import * as grpc from 'grpc'
import { Client } from './client'
import * as Type from './typedef/execution'
import * as API from './api/execution'

export default class Execution extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Execution')
  }

  public async create(request: API.mesg.grpc.orchestrator.ExecutionCreateRequest, signature: string): Promise<API.mesg.grpc.orchestrator.ExecutionCreateResponse> {
    return this.unaryCall("Create", request, signature)
  }

  public stream(request: API.mesg.grpc.orchestrator.ExecutionStreamRequest, signature: string): grpc.ClientReadableStream<Type.mesg.types.IExecution> {
    return this.streamCall('Stream', request, signature)
  }
}
