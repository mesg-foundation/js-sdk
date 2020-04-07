import * as grpc from 'grpc'
import * as protoLoader from '@grpc/proto-loader'
import * as path from 'path'
import Transaction from '@mesg/api/lib/transaction'
import sortObject from '@mesg/api/lib/util/sort-object'

export class Client {

  protected client: any

  constructor(endpoint: string, service: string) {
    const protoOpts = { includeDirs: [__dirname] }
    const { mesg } = grpc.loadPackageDefinition(protoLoader.loadSync(path.join(__dirname, 'orchestrator', service.toLowerCase() + '.proto'), protoOpts)) as any
    this.client = new mesg.grpc.orchestrator[service](endpoint, grpc.credentials.createInsecure())
  }

  protected streamCall(method: string, arg: any, privKey: Buffer): grpc.ClientReadableStream<any> {
    return this.client[method](arg, this.signArg(arg, privKey))
  }

  protected async unaryCall(method: string, arg: any, privKey: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client[method](arg, this.signArg(arg, privKey), (err: Error, res: any) => err ? reject(err) : resolve(res))
    })
  }

  private signArg(arg: any, privKey: Buffer): grpc.Metadata {
    const { signature } = Transaction.sign(JSON.stringify(sortObject(arg)), privKey)
    const meta = new grpc.Metadata()
    meta.add('mesg_request_signature', Buffer.from(signature).toString('base64'))
    return meta
  }
}