import { existsSync, mkdirSync, readFileSync, writeFileSync, rmdirSync } from "fs";
import Listr, { ListrTask } from 'listr'
import { join } from "path";
import Account from "@mesg/api/lib/account-lcd";
import { safeLoad, safeDump } from "js-yaml";
import { fetchImageTag, hasImage, createService as createDockerService, listServices, waitForEvent } from "./utils/docker";
import { isRunning, waitToBeReady } from "./utils/lcd";
import merge from "lodash.merge";
import deployer, { createTar } from "./utils/deployer";
import { service as serviceCompiler } from '@mesg/compiler'
import { IService } from "@mesg/api/lib/service-lcd";
import API from "@mesg/api/lib/lcd";
import * as b58 from "@mesg/api/lib/util/base58";
import GRPCAPI from "@mesg/api";
import { Stream as GRPCStream } from "@mesg/api/lib/util/grpc";
import { findHash } from "./utils/txevent";
import { IsAlreadyExistsError } from "./utils/error";
import { Stream } from "stream";
import { IEvent } from "@mesg/api/lib/event";
import { IExecution } from "@mesg/api/lib/execution";
import { ExecutionStatus } from "@mesg/api/lib/types";

const loadYaml = (file: string) => existsSync(file)
  ? safeLoad(readFileSync(file).toString())
  : {}

export type ICreateConfig = { configDir: string }
export const createConfig: ListrTask<ICreateConfig> = {
  title: 'Create default configuration',
  skip: (ctx) => existsSync(ctx.configDir),
  task: (ctx) => mkdirSync(ctx.configDir)
}

export type IClearConfig = { configDir: string }
export const clearConfig: ListrTask<IClearConfig> = {
  title: 'Clear config',
  task: ctx => (rmdirSync as any)(ctx.configDir, { recursive: true })
}

export type IGenerateAccount = { mnemonic?: string, configDir: string, configFile: string }
export const generateAccount: ListrTask<IGenerateAccount> = {
  title: 'Generate test account',
  skip: (ctx) => {
    if (!ctx.mnemonic) {
      ctx.mnemonic = (loadYaml(join(ctx.configDir, ctx.configFile)).account || {}).mnemonic
    }
    return ctx.mnemonic
  },
  task: (ctx, task) => {
    ctx.mnemonic = Account.generateMnemonic()
    task.output = ctx.mnemonic
  }
}

export type IUpdateDockerImage = { pull: boolean, image: string, tag: string }
export const updateDockerImage: ListrTask<IUpdateDockerImage> = {
  title: 'Update engine image',
  skip: async (ctx) => !ctx.pull && await hasImage(ctx.image),
  task: (ctx) => fetchImageTag(ctx.image, ctx.tag)
}

export type IStartEngine = { configDir: string, configFile: string, mnemonic: string, image: string }
export const startEngine: ListrTask<IStartEngine> = {
  title: 'Start engine',
  skip: () => isRunning(),
  task: (ctx) => {
    const configFile = join(ctx.configDir, ctx.configFile)
    const newConfigs = merge({}, loadYaml(configFile), {
      account: {
        mnemonic: ctx.mnemonic
      }
    })
    writeFileSync(configFile, safeDump(newConfigs))
    return createDockerService(ctx.image, 'engine', ctx.configDir)
  }
}

export type ILCDApiReady = {}
export const lcdApiReady: ListrTask<ILCDApiReady> = {
  title: 'Wait for API',
  skip: () => isRunning(),
  task: () => waitToBeReady()
}

export type IStartEnvironment = ICreateConfig | IGenerateAccount | IUpdateDockerImage | IStartEngine | ILCDApiReady
export const startEnvironment: ListrTask<IStartEnvironment> = {
  title: 'Start environment',
  task: () => new Listr<IStartEnvironment>([
    createConfig,
    generateAccount,
    updateDockerImage,
    startEngine,
    lcdApiReady
  ])
}

export type IStopEnvironment = {}
export const stopEnvironment: ListrTask<IStopEnvironment> = {
  title: 'Stop environment',
  task: async (ctx, task) => {
    const services = await listServices({ name: ['engine'] })
    if (services.length === 0) throw new Error('Cannot find engine')
    const service = services[0]
    let image = (service.data as any).Spec.TaskTemplate.ContainerSpec.Image
    image = [
      image.split(':')[0],
      image.split(':')[1] || 'latest'
    ].join(':')
    const eventPromise = waitForEvent(({ Action, from, Type }) => {
      return Type === 'container' && Action === 'destroy' && from === image
    })
    await service.remove()
    await eventPromise
  }
}

export type ICompileService = { path: string, ipfsClient: any, definition?: IService }
export const compileService: ListrTask<ICompileService> = {
  title: 'Compile service',
  task: async (ctx) => {
    const path = await deployer(ctx.path)
    const definition = await serviceCompiler(readFileSync(join(path, 'mesg.yml')))
    const buffer: any[] = []
    definition.source = await new Promise<string>((resolve, reject) => {
      createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => {
          const res = await ctx.ipfsClient.add(Buffer.from(buffer), { pin: true })
          if (!res.length) {
            return reject(new Error('pushing service manifest failed'))
          }
          return resolve(res[0].hash)
        })
    })
    ctx.definition = definition
  }
}

export type ICreateService = { lcd: API, definition: IService, mnemonic: string, serviceHash?: string }
export const createService: ListrTask<ICreateService> = {
  title: 'Create service',
  skip: async (ctx) => {
    const hash = await ctx.lcd.service.hash(ctx.definition)
    if (await ctx.lcd.service.exists(hash)) {
      ctx.serviceHash = hash
      return hash as any
    }
    return ''
  },
  task: async (ctx) => {
    const account = await ctx.lcd.account.import(ctx.mnemonic)
    const tx = await ctx.lcd.createTransaction(
      [ctx.lcd.service.createMsg(account.address, ctx.definition)],
      account
    )
    const txResult = await ctx.lcd.broadcast(tx.signWithMnemonic(ctx.mnemonic))
    const hashes = findHash(txResult, "service", "CreateService")
    if (hashes.length != 1) throw new Error('error while getting the hash of the service created')
    ctx.serviceHash = hashes[0]
  }
}

export type IStartService = { grpc: GRPCAPI, lcd: API, serviceHash: string, env: string[], runnerHash?: string, instanceHash?: string }
export const startService: ListrTask<IStartService> = {
  title: 'Start service',
  task: async (ctx, task) => {
    try {
      const response = await ctx.grpc.runner.create({
        serviceHash: b58.decode(ctx.serviceHash),
        env: ctx.env
      })
      ctx.runnerHash = b58.encode(response.hash)
    } catch (e) {
      if (!IsAlreadyExistsError.match(e)) throw e
      ctx.runnerHash = b58.encode(new IsAlreadyExistsError(e).hash)
      task.skip(ctx.runnerHash)
    }
    const runner = await ctx.lcd.runner.get(ctx.runnerHash)
    ctx.instanceHash = runner.instanceHash
  }
}

export type IRunnerLogs = { runnerHash: string, runnerLogs?: Stream[] }
export const runnerLogs: ListrTask<IRunnerLogs> = {
  title: 'Log service\'s outputs',
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

export type IRunnerLogsStop = { runnerLogs: Stream[] }
export const runnerLogsStop: ListrTask<IRunnerLogsStop> = {
  title: 'Stop service\'s outputs',
  task: async (ctx) => ctx.runnerLogs.forEach((x: any) => x.destroy())
}

export type IInstanceEventLogs = { grpc: GRPCAPI, instanceHash: string, eventLogs?: GRPCStream<IEvent> }
export const instanceEventLogs: ListrTask<IInstanceEventLogs> = {
  title: 'Log service\'s event',
  task: (ctx) => {
    ctx.eventLogs = ctx.grpc.event.stream({
      filter: {
        instanceHash: b58.decode(ctx.instanceHash)
      }
    })
  }
}

export type IInstanceEventLogsStop = { eventLogs: GRPCStream<IEvent> }
export const instanceEventLogsStop: ListrTask<IInstanceEventLogsStop> = {
  title: 'Stop service\'s event logs',
  task: (ctx) => ctx.eventLogs.cancel()
}

export type IRunnerResultLogs = { grpc: GRPCAPI, runnerHash: string, resultLogs?: GRPCStream<IExecution> }
export const runnerResultLogs: ListrTask<IRunnerResultLogs> = {
  title: 'Log service\'s result',
  task: (ctx) => {
    ctx.resultLogs = ctx.grpc.execution.stream({
      filter: {
        executorHash: b58.decode(ctx.runnerHash),
        statuses: [
          ExecutionStatus.COMPLETED,
          ExecutionStatus.FAILED,
        ]
      }
    })
  }
}

export type IRunnerResultLogsStop = { resultLogs: GRPCStream<IExecution> }
export const runnerResultLogsStop: ListrTask<IRunnerResultLogsStop> = {
  title: 'Stop Service\'s result logs',
  task: (ctx) => ctx.resultLogs.cancel()
}

export type IServiceLogs = IRunnerLogs | IInstanceEventLogs | IRunnerResultLogs
export const serviceLogs: ListrTask<IServiceLogs> = {
  title: 'Start service\'s logs',
  task: () => new Listr<IServiceLogs>([
    runnerLogs,
    instanceEventLogs,
    runnerResultLogs
  ])
}

export type IServiceLogsStop = IRunnerLogsStop | IInstanceEventLogsStop | IRunnerResultLogsStop
export const serviceLogsStop: ListrTask<IServiceLogsStop> = {
  title: 'Start service\'s logs',
  task: () => new Listr<IServiceLogsStop>([
    runnerLogsStop,
    instanceEventLogsStop,
    runnerResultLogsStop
  ])
}