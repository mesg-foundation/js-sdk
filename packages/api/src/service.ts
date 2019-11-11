import { createClient, promisify } from './util/grpc'
import * as ServiceType from './typedef/service'

export type IService = ServiceType.mesg.types.IService

export type ServiceGetInputs = ServiceType.mesg.api.IGetServiceRequest
export type ServiceGetOutputs = Promise<IService>

export type ServiceHashInputs = ServiceType.mesg.api.ICreateServiceRequest
export type ServiceHashOutputs = Promise<ServiceType.mesg.api.IHashServiceResponse>

export type ServiceExistsInputs = ServiceType.mesg.api.IExistsServiceRequest
export type ServiceExistsOutputs = Promise<ServiceType.mesg.api.IExistsServiceResponse>

export type ServiceListInputs = ServiceType.mesg.api.IListServiceRequest
export type ServiceListOutputs = Promise<ServiceType.mesg.api.IListServiceResponse>

export type ServiceCreateInputs = ServiceType.mesg.api.ICreateServiceRequest
export type ServiceCreateOutputs = Promise<ServiceType.mesg.api.ICreateServiceResponse>

export default class Service {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Service', './protobuf/api/service.proto', endpoint)
  }

  async create(request: ServiceCreateInputs): ServiceCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  async get(request: ServiceGetInputs): ServiceGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }
  
  async exists(request: ServiceExistsInputs): ServiceExistsOutputs { 
    return promisify(this._client, 'Exists')(request)
  }
  
  async hash(request: ServiceHashInputs): ServiceHashOutputs { 
    return promisify(this._client, 'Hash')(request)
  }
  
  async list(request: ServiceListInputs): ServiceListOutputs { 
    return promisify(this._client, 'List')(request)
  }
}