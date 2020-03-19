import { ListrTask } from "listr"
import { Stream } from "stream"
import { listServices } from "../utils/docker"
import GRPCAPI from "@mesg/api";
import { Stream as GRPCStream } from "@mesg/api/lib/util/grpc";
import * as base58 from "@mesg/api/lib/util/base58";
import { ExecutionStatus } from "@mesg/api/lib/types";
import { IExecution } from "@mesg/api/lib/execution";
import { IRunner } from "@mesg/api/lib/runner-lcd";
import API from "@mesg/api/lib/lcd";
import { resolveSIDRunner } from "@mesg/api/lib/util/resolve";
import { IsAlreadyExistsError } from "../utils/error";

export type ILogs = { runnerHash: string, runnerLogs?: Stream[] }
export const logs: ListrTask<ILogs> = {
  title: 'Fetching service\'s logs',
  task: async (ctx) => {
    const dockerServices = await listServices({ label: [`mesg.runner=${ctx.runnerHash}`] })
    ctx.runnerLogs = await Promise.all(dockerServices.map(x => x.logs({
      stderr: true,
      stdout: true,
      follow: true,
      tail: 'all',
    }) as unknown as Promise<Stream>))
  }
}

export type ILogsStop = { runnerLogs: Stream[] }
export const logsStop: ListrTask<ILogsStop> = {
  title: 'Stopping fetching service\'s logs',
  task: async (ctx) => ctx.runnerLogs.forEach((x: any) => x.destroy())
}

export type IResultLogs = { grpc: GRPCAPI, runnerHash: string, resultLogs?: GRPCStream<IExecution> }
export const resultLogs: ListrTask<IResultLogs> = {
  title: 'Fetching executions\' logs',
  task: (ctx) => {
    ctx.resultLogs = ctx.grpc.execution.stream({
      filter: {
        executorHash: base58.decode(ctx.runnerHash),
        statuses: [
          ExecutionStatus.COMPLETED,
          ExecutionStatus.FAILED,
        ]
      }
    })
  }
}

export type IResultLogsStop = { resultLogs: GRPCStream<IExecution> }
export const resultLogsStop: ListrTask<IResultLogsStop> = {
  title: 'Stopping fetching execution\'s logs',
  task: (ctx) => ctx.resultLogs.cancel()
}

export type IGet = { lcd: API, runnerHash: string, runner: IRunner }
export const get: ListrTask<IGet> = {
  title: 'Getting runner\'s info',
  task: async (ctx) => {
    try {
      ctx.runner = await ctx.lcd.runner.get(ctx.runnerHash)
    } catch (err) {
      const hash = await resolveSIDRunner(ctx.lcd, ctx.runnerHash)
      ctx.runner = await ctx.lcd.runner.get(hash)
    }
  }
}

export type ICreate = { grpc: GRPCAPI, lcd: API, serviceHash: string, env: string[], runnerHash?: string, instanceHash?: string }
export const create: ListrTask<ICreate> = {
  title: 'Creating runner',
  task: async (ctx, task) => {
    try {
      const response = await ctx.grpc.runner.create({
        serviceHash: base58.decode(ctx.serviceHash),
        env: ctx.env
      })
      ctx.runnerHash = base58.encode(response.hash)
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      ctx.runnerHash = base58.encode(new IsAlreadyExistsError(e).hash)
      task.skip(ctx.runnerHash)
    }
    const runner = await ctx.lcd.runner.get(ctx.runnerHash)
    ctx.instanceHash = runner.instanceHash
  }
}
