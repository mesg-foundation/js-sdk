import { Client } from './client'
import * as API from './api/runner'

export default class Runner extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Runner')
  }

  public async register(request: API.mesg.grpc.orchestrator.IRunnerRegisterRequest, signature: string): Promise<API.mesg.grpc.orchestrator.IRunnerRegisterResponse> {
    return this.unaryCall("Register", request, signature)
  }

  public async delete(request: API.mesg.grpc.orchestrator.IRunnerDeleteRequest, signature: string): Promise<API.mesg.grpc.orchestrator.IRunnerRegisterResponse> {
    return this.unaryCall("Delete", request, signature)
  }
}
