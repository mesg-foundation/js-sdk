import { createClient, promisify } from './util/grpc'
import * as InstanceType from './typedef/instance'

export type IInstance = InstanceType.mesg.types.IInstance

export type InstanceGetInputs = InstanceType.mesg.api.IGetInstanceRequest
export type InstanceGetOutputs = Promise<IInstance>

export type InstanceListInputs = InstanceType.mesg.api.IListInstanceRequest
export type InstanceListOutputs = Promise<InstanceType.mesg.api.IListInstanceResponse>

export default class Instance {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Instance', './protobuf/api/instance.proto', endpoint)
  }

  async get(request: InstanceGetInputs): InstanceGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }

  async list(request: InstanceListInputs): InstanceListOutputs { 
    return promisify(this._client, 'List')(request)
  }
}