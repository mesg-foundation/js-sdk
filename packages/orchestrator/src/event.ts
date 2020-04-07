import * as base58 from '@mesg/api/lib/util/base58'
import * as grpc from 'grpc'
import { Client } from './client'
import { mesg } from './typedef/event'

type Filter = {
  hash?: string
  instanceHash?: string
  key?: string
}

export default class Event extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Event')
  }

  public stream(filter: Filter = {}, privateKey: Buffer): grpc.ClientReadableStream<mesg.types.Event> {
    return this.streamCall('Stream', {
      filter: {
        hash: filter.hash ? base58.decode(filter.hash) : null,
        instanceHash: filter.instanceHash ? base58.decode(filter.instanceHash) : null,
        key: filter.key
      }
    }, privateKey)
  }
}
