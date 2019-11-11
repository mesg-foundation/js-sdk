import { createClient, promisify, Stream } from './util/grpc'
import * as EventType from './typedef/event'

export type IEvent = EventType.mesg.types.IEvent

export type EventCreateInputs = EventType.mesg.api.ICreateEventRequest
export type EventCreateOutputs = Promise<EventType.mesg.api.ICreateEventResponse>

export type EventStreamInputs = EventType.mesg.api.StreamEventRequest
export type EventStreamOutputs = Stream<IEvent>

export default class Event {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Event', './protobuf/api/event.proto', endpoint)
  }

  async create(request: EventCreateInputs): EventCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  stream(request: EventStreamInputs): EventStreamOutputs {
    return this._client.Stream(request)
  }
}