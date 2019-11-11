import { v4 as uuid} from 'uuid'
import { mesg } from "@mesg/api/lib/typedef/execution";
import { decode, encode } from '@mesg/api/lib/util/encoder';
import { checkStreamReady, errNoStatus, Stream } from '@mesg/api/lib/util/grpc'
import api, { API, ExecutionCreateInputs, ExecutionCreateOutputs, EventStreamInputs, Event, ExecutionStreamInputs, Execution, ExecutionStatus, hash } from '@mesg/api';
import { resolveSID } from '@mesg/api/lib/util/resolve'

const defaultEndpoint = 'localhost:50052'

type Options = {
  api?: API
}

class Application {
  // api gives access to low level gRPC calls.
  private api: API

  constructor(_api?: API) {
    this.api = _api || api(defaultEndpoint);
  }

  decodeData(data: mesg.protobuf.IStruct) {
    return decode(data)
  }

  encodeData(data: { [key: string]: any }) {
    return encode(data)
  }

  resolve(sid: string): Promise<hash> {
    return resolveSID(this.api, sid)
  }

  listenEvent(request: EventStreamInputs): Stream<Event> {
    return this.api.event.stream(request)
  }

  listenResult(request: ExecutionStreamInputs): Stream<Execution> {
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

  executeTask(request: ExecutionCreateInputs): ExecutionCreateOutputs {
    return this.api.execution.create(request)
  }

  executeTaskAndWaitResult(request: ExecutionCreateInputs): Promise<Execution> {
    return new Promise<Execution>((resolve, reject) => {
      const tag = uuid()
      const stream = this.listenResult({
        filter: {
          instanceHash: request.instanceHash,
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
