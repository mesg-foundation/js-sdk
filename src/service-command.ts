import {application} from 'mesg-js'

import Command from './root-command'

export interface Service {
  sid: string
  hash: string
  name: string
  status: number
}

type UNARY_METHODS = 'DeleteService'
  | 'GetService'
  | 'ListServices'
  | 'StartService'
  | 'StopService'

export default abstract class extends Command {
  static flags = {
    ...Command.flags
  }

  protected mesg = application({
    endpoint: 'localhost:50052'
  })

  status(s: number) {
    return ['unknown', 'stopped', 'starting', 'partial', 'running'][s]
  }

  async unaryCall(method: UNARY_METHODS, data: object): Promise<any> {
    return new Promise((resolve, reject) => this.mesg.api[method](data, (error: Error, res: any) => error
      ? reject(error)
      : resolve(res)))
  }
}
