import { createClient, promisify } from './util/grpc'
import * as ProcessType from './typedef/process'

export type IProcess = ProcessType.mesg.types.IProcess

export type ProcessGetInputs = ProcessType.mesg.api.IGetProcessRequest
export type ProcessGetOutputs = Promise<IProcess>

export type ProcessListInputs = ProcessType.mesg.api.IListProcessRequest
export type ProcessListOutputs = Promise<ProcessType.mesg.api.IListProcessResponse>

export type ProcessCreateInputs = ProcessType.mesg.api.ICreateProcessRequest
export type ProcessCreateOutputs = Promise<ProcessType.mesg.api.ICreateProcessResponse>

export type ProcessDeleteInputs = ProcessType.mesg.api.IDeleteProcessRequest
export type ProcessDeleteOutputs = Promise<ProcessType.mesg.api.IDeleteProcessResponse>

export default class Process {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Process', './protobuf/api/process.proto', endpoint)
  }

  async create(request: ProcessCreateInputs): ProcessCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  async get(request: ProcessGetInputs): ProcessGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }
  
  async list(request: ProcessListInputs): ProcessListOutputs { 
    return promisify(this._client, 'List')(request)
  }

  async delete(request: ProcessDeleteInputs): ProcessDeleteOutputs { 
    return promisify(this._client, 'Delete')(request)
  }
}