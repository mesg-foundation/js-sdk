import * as grpc from 'grpc'
import * as base58 from '@mesg/api/lib/util/base58'
import { Client } from './client'
import * as Type from './typedef/event'
import * as API from './api/event'

export type StreamRequest = {
  filter: {
    hash?: string
    instanceHash?: string
    key?: string
  }
}

export default class Event extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Event')
  }

  public stream(request: StreamRequest, signature: string): grpc.ClientReadableStream<Type.mesg.types.IEvent> {
    const grpcReq: API.mesg.grpc.orchestrator.IEventStreamRequest = {
      filter: {
        hash: request.filter.hash ? base58.decode(request.filter.hash) : null,
        instanceHash: request.filter.instanceHash ? base58.decode(request.filter.instanceHash) : null,
        key: request.filter.key,
      }
    }
    return this.streamCall('Stream', grpcReq, signature)
  }
}
