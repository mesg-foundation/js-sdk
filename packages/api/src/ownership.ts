import { createClient, promisify } from './util/grpc'
import * as OwnershipType from './typedef/ownership'

export type IOwnership = OwnershipType.mesg.types.IOwnership

export type OwnershipListInputs = OwnershipType.mesg.api.IListOwnershipRequest
export type OwnershipListOutputs = Promise<OwnershipType.mesg.api.IListOwnershipResponse>

export default class Ownership {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Ownership', './protobuf/api/ownership.proto', endpoint)
  }

  async list(request: OwnershipListInputs): OwnershipListOutputs { 
    return promisify(this._client, 'List')(request)
  }
}