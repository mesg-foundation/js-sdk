import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'

export class Client {

  protected client: any

  constructor(endpoint: string, service: string) {
    const protoOpts = { includeDirs: [__dirname] }
    const { mesg } = grpc.loadPackageDefinition(protoLoader.loadSync(path.join(__dirname, 'orchestrator', service.toLowerCase() + '.proto'), protoOpts)) as any
    this.client = new mesg.grpc.orchestrator[service](endpoint, grpc.credentials.createInsecure())
  }

  protected streamCall(method: string, arg: any, signature: string): grpc.ClientReadableStream<any> {
    return this.client[method](arg, this.meta(signature))
  }

  protected async unaryCall(method: string, arg: any, signature: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client[method](arg, this.meta(signature), (err: Error, res: any) => err ? reject(err) : resolve(res))
    })
  }

  private meta(signature: string): grpc.Metadata {
    const meta = new grpc.Metadata()
    meta.add('mesg_request_signature', signature)
    return meta
  }
}