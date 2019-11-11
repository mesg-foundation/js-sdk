import { createClient, promisify } from './util/grpc'
import * as RunnerType from './typedef/runner'

export type IRunner = RunnerType.mesg.types.IRunner

export type RunnerGetInputs = RunnerType.mesg.api.IGetRunnerRequest
export type RunnerGetOutputs = Promise<IRunner>

export type RunnerListInputs = RunnerType.mesg.api.IListRunnerRequest
export type RunnerListOutputs = Promise<RunnerType.mesg.api.IListRunnerResponse>

export type RunnerCreateInputs = RunnerType.mesg.api.ICreateRunnerRequest
export type RunnerCreateOutputs = Promise<IRunner>

export type RunnerDeleteInputs = RunnerType.mesg.api.IDeleteRunnerRequest
export type RunnerDeleteOutputs = Promise<RunnerType.mesg.api.IDeleteRunnerResponse>

export default class Runner {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Runner', './protobuf/api/runner.proto', endpoint)
  }

  async create(request: RunnerCreateInputs): RunnerCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  async get(request: RunnerGetInputs): RunnerGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }
  
  async list(request: RunnerListInputs): RunnerListOutputs { 
    return promisify(this._client, 'List')(request)
  }

  async delete(request: RunnerDeleteInputs): RunnerDeleteOutputs { 
    return promisify(this._client, 'Delete')(request)
  }
}