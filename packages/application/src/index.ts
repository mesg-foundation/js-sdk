import { v4 as uuid} from 'uuid'
import { mesg } from "@mesg/api/lib/typedef/execution";
import { decode, encode } from '@mesg/api/lib/util/encoder';
import { checkStreamReady, errNoStatus, Stream } from '@mesg/api/lib/util/grpc'
import API from '@mesg/api';
import { IApi } from '@mesg/api/lib/types';
import { resolveSID } from '@mesg/api/lib/util/resolve'
import { hash, ExecutionStatus } from '@mesg/api/lib/types';
import { EventStreamInputs, IEvent } from '@mesg/api/lib/event';
import { ExecutionStreamInputs, IExecution, ExecutionCreateInputs, ExecutionCreateOutputs } from '@mesg/api/lib/execution';

const defaultEndpoint = 'localhost:50052'

type Options = {
  api?: IApi
}

class Application {
  // api gives access to low level gRPC calls.
  private api: IApi

  constructor(_api?: IApi) {
    this.api = _api || new API(defaultEndpoint);
  }

  decodeData(data: mesg.protobuf.IStruct) {
    return decode(data)
  }

  encodeData(data: { [key: string]: any }) {
    return encode(data)
  }

  async resolve(sid: string): Promise<hash> {
    return resolveSID(this.api, sid)
  }

  listenEvent(request: EventStreamInputs): Stream<IEvent> {
    return this.api.event.stream(request)
  }

  listenResult(request: ExecutionStreamInputs): Stream<IExecution> {
    return this.api.execution.stream({
      filter: {
        ...(request.filter || {}),
        statuses: [
          ExecutionStatus.COMPLETED,
          ExecutionStatus.FAILED,
        ]
      }
    })
  }

  async executeTask(request: ExecutionCreateInputs): ExecutionCreateOutputs {
    return this.api.execution.create(request)
  }

  async executeTaskAndWaitResult(request: ExecutionCreateInputs): Promise<IExecution> {
    return new Promise<IExecution>((resolve, reject) => {
      const tag = uuid()
      const stream = this.listenResult({
        filter: {
          executorHash: request.executorHash,
          tags: [tag]
        }
      })
        .on('metadata', (metadata) => {
          const err = checkStreamReady(metadata)
          if (err == errNoStatus) return
          if (err) {
            stream.destroy(err)
            return
          }
          this.executeTask({
            ...request,
            tags: [...(request.tags || []), tag]
          }).catch((err) => stream.destroy(err))
        })
        .on('data', (result) => {
          stream.cancel()
          result.error ? reject(new Error(result.error)) : resolve(result)
        })
        .on('error', (err) => {
          stream.cancel()
          reject(err)
        })
    })
  }
}

export default Application;
export {
  Options,
  Stream,
}
