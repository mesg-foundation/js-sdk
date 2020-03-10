import { v4 as uuid} from 'uuid'
import { mesg } from "@mesg/api/lib/typedef/execution";
import { decode, encode } from '@mesg/api/lib/util/encoder';
import { checkStreamReady, errNoStatus, Stream } from '@mesg/api/lib/util/grpc'
import API from '@mesg/api';
import { IApi } from '@mesg/api/lib/types';
import { resolveSID, resolveSIDRunner } from '@mesg/api/lib/util/resolve'
import { ExecutionStatus } from '@mesg/api/lib/types';
import { EventStreamInputs, IEvent } from '@mesg/api/lib/event';
import { ExecutionStreamInputs, IExecution, ExecutionCreateInputs, ExecutionCreateOutputs } from '@mesg/api/lib/execution';
import LCD from '@mesg/api/lib/lcd';

const defaultEndpoint = 'localhost:50052'
const defaultLCDEndpoint = 'http://localhost:1317'

type Options = {
  api?: IApi
}

class Application {
  // api gives access to low level gRPC calls.
  private api: IApi
  // api gives access to lcd api.
  private lcd: LCD

  constructor(_api?: IApi, _lcd?: LCD) {
    this.api = _api || new API(defaultEndpoint);
    this.lcd = _lcd || new LCD(defaultLCDEndpoint);
  }

  decodeData(data: mesg.protobuf.IStruct) {
    return decode(data)
  }

  encodeData(data: { [key: string]: any }) {
    return encode(data)
  }

  async resolve(sid: string): Promise<string> {
    return resolveSID(this.lcd, sid)
  }

  async resolveRunner(sid: string): Promise<string> {
    return resolveSIDRunner(this.lcd, sid)
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
(module).exports = Application;
export {
  Options,
  Stream,
}
