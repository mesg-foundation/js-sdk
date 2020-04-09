import { Client } from './client'
import * as base58 from '@mesg/api/lib/util/base58'
import * as API from './api/runner'

export type RegisterRequest = {
  serviceHash: string
  envHash: string
}

export type DeleteRequest = {
  runnerHash: string
}

export default class Runner extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Runner')
  }

  public async register(request: RegisterRequest, signature: string): Promise<API.mesg.grpc.orchestrator.IRunnerRegisterResponse> {
    const grpcReq: API.mesg.grpc.orchestrator.IRunnerRegisterRequest = {
      envHash: base58.decode(request.envHash),
      serviceHash: base58.decode(request.serviceHash)
    }
    return this.unaryCall("Register", grpcReq, signature)
  }

  public async delete(request: DeleteRequest, signature: string): Promise<API.mesg.grpc.orchestrator.IRunnerRegisterResponse> {
    const grpcReq: API.mesg.grpc.orchestrator.IRunnerDeleteRequest = {
      runnerHash: base58.decode(request.runnerHash)
    }
    return this.unaryCall("Delete", grpcReq, signature)
  }
}
