import { createClient, promisify, Stream } from './util/grpc'
import * as ExecutionType from './typedef/execution'

export type IExecution = ExecutionType.mesg.types.IExecution

export type ExecutionGetInputs = ExecutionType.mesg.api.IGetExecutionRequest
export type ExecutionGetOutputs = Promise<IExecution>

export type ExecutionStreamInputs = ExecutionType.mesg.api.IStreamExecutionRequest
export type ExecutionStreamOutputs = Stream<IExecution>

export type ExecutionCreateInputs = ExecutionType.mesg.api.ICreateExecutionRequest
export type ExecutionCreateOutputs = Promise<ExecutionType.mesg.api.ICreateExecutionResponse>

export type ExecutionUpdateInputs = ExecutionType.mesg.api.IUpdateExecutionRequest
export type ExecutionUpdateOutputs = Promise<ExecutionType.mesg.api.IUpdateExecutionResponse>

export default class Execution {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Execution', './protobuf/api/execution.proto', endpoint)
  }

  async create(request: ExecutionCreateInputs): ExecutionCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  async get(request: ExecutionGetInputs): ExecutionGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }

  async update(request: ExecutionUpdateInputs): ExecutionUpdateOutputs { 
    return promisify(this._client, 'Update')(request)
  }

  stream(request: ExecutionStreamInputs): ExecutionStreamOutputs {
    return this._client.Stream(request)
  }
}