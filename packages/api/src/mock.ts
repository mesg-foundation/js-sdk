import { EventEmitter } from 'events'
import { IApi } from './types'
import { Stream } from './util/grpc';
import { encode } from './util/encoder';

const hash = Buffer.from('hash')

class StreamMock<T> implements Stream<T> {
  private eventEmitter = new EventEmitter()
  on(event: 'data' | 'end' | 'error' | 'status' | 'metadata', listener: (data: any) => void): this {
    this.eventEmitter.on(event, listener)
    return this
  }
  cancel(): void { }
  destroy(err?: Error): void { }
  emit(event: 'data' | 'end' | 'error' | 'status' | 'metadata', data: any) {
    this.eventEmitter.emit(event, data)
  }
}

export const streams = {
  event: new StreamMock<any>(),
  execution: new StreamMock<any>()
}

export default (endpoint: string): IApi => ({
  account: {
    async get() { return {} },
    async list() { return { accounts: [] } },
    async create() { return { name: "name", mnemonic: "mnemonic" } },
    async delete() { return {} },
  },
  event: {
    async create() { return { hash } },
    stream() { return streams.event },
  },
  execution: {
    async create() { return { hash } },
    async get() { return { parentHash: hash, eventHash: Buffer.from('xxx'), status: 0, instanceHash: hash, taskKey: 'xxx', inputs: encode({}) } },
    stream() { return streams.execution },
    async update() { return {} }
  },
  instance: {
    async get() { return { serviceHash: hash } },
    async list() { return { instances: [] } }
  },
  runner: {
    async create() { return { hash } },
    async get() { return { hash: hash, address: '', instanceHash: hash } },
    async list() { return { runners: [] } },
    async delete() { return {} }
  },
  service: {
    async create() { return { hash } },
    async get() { return { sid: 'xxx', source: 'xxx' } },
    async hash() { return { hash } },
    async exists() { return { exists: true } },
    async list() { return { services: [] } },
  },
  process: {
    async create() { return { hash } },
    async get() { return { } },
    async list() { return { processes: [] } },
    async delete() { return {} },
  },
  ownership: {
    async list() { return { ownerships: [] } },
  }
})

export * from './types' 
