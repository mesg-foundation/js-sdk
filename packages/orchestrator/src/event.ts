import * as grpc from 'grpc'
import { Client } from './client'
import * as Type from './typedef/event'
import * as API from './api/event'

export default class Event extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Event')
  }

  public stream(request: API.mesg.grpc.orchestrator.IEventStreamRequest, signature: string): grpc.ClientReadableStream<Type.mesg.types.IEvent> {
    return this.streamCall('Stream', request, signature)
  }
}
