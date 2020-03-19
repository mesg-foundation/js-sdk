import { ListrTask } from "listr"
import GRPCAPI from "@mesg/api";
import { Stream as GRPCStream } from "@mesg/api/lib/util/grpc";
import * as base58 from "@mesg/api/lib/util/base58";
import { IEvent } from "@mesg/api/lib/event";
import API from "@mesg/api/lib/lcd";
import { IRunner } from "@mesg/api/lib/runner-lcd";
import { IInstance } from "@mesg/api/lib/instance-lcd";

export type IEventLogs = { grpc: GRPCAPI, instanceHash: string, eventLogs?: GRPCStream<IEvent> }
export const eventLogs: ListrTask<IEventLogs> = {
  title: 'Fetching events\' logs',
  task: (ctx) => {
    ctx.eventLogs = ctx.grpc.event.stream({
      filter: {
        instanceHash: base58.decode(ctx.instanceHash)
      }
    })
  }
}

export type IEventLogsStop = { eventLogs: GRPCStream<IEvent> }
export const eventLogsStop: ListrTask<IEventLogsStop> = {
  title: 'Stopping events\' logs',
  task: (ctx) => ctx.eventLogs.cancel()
}

export type IGet = { lcd: API, runner?: IRunner, instanceHash?: string, instance: IInstance }
export const get: ListrTask<IGet> = {
  title: 'Get instance',
  task: async (ctx) => ctx.instance = await ctx.lcd.instance.get(ctx.instanceHash || ctx.runner.instanceHash)
}
