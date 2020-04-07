import * as base58 from '@mesg/api/lib/util/base58'
import { encode } from '@mesg/api/lib/util/encoder'
import * as grpc from 'grpc'
import { Client } from './client'
import { mesg } from './typedef/execution'

type Filter = {
  statuses?: mesg.types.Status[];
  instanceHash?: string
  taskKey?: string;
  tags?: string[]
  executorHash?: string;
}

export default class Execution extends Client {
  constructor(endpoint: string) {
    super(endpoint, 'Execution')
  }

  public async create(executorHash: string, taskKey: string, inputs: Object, signature: string, options: { tags?: string[], price: string } = { price: "10000atto" }): Promise<{ hash: string }> {
    const res = await this.unaryCall("Create", {
      taskKey,
      inputs: encode(inputs),
      executorHash: base58.decode(executorHash),
      price: options.price,
      tags: options.tags || []
    }, signature)
    return {
      hash: base58.encode(res.hash)
    }
  }

  public stream(filter: Filter = {}, signature: string): grpc.ClientReadableStream<mesg.types.IExecution> {
    return this.streamCall('Stream', {
      filter: {
        statuses: filter.statuses || [],
        instanceHash: filter.instanceHash ? base58.decode(filter.instanceHash) : null,
        taskKey: filter.taskKey,
        tags: filter.tags || [],
        executorHash: filter.executorHash ? base58.decode(filter.executorHash) : null,
      }
    }, signature)
  }
}
