import * as base58 from '@mesg/api/lib/util/base58'
import { Client } from './client'

export default class Runner extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Runner')
  }

  public async register(serviceHash: string, envHash: string, privateKey: Buffer): Promise<{ token: string }> {
    const res = await this.unaryCall("Register", {
      serviceHash: base58.decode(serviceHash),
      envHash: base58.decode(envHash),
    }, privateKey)
    return {
      token: res.token
    }
  }

  public async delete(runnerHash: string, privateKey: Buffer): Promise<void> {
    await this.unaryCall("Delete", {
      runnerHash: base58.decode(runnerHash),
    }, privateKey)
  }
}
