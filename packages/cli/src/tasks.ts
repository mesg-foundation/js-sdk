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
import { registerHelper, compile } from "handlebars";
import { resolveSIDRunner } from "@mesg/api/lib/util/resolve";
import { IRunner } from "@mesg/api/lib/runner-lcd";
import { IInstance } from "@mesg/api/lib/instance-lcd";
import Application from "@mesg/application";
import ExecutionType from "@mesg/api/lib/typedef/execution";
import ServiceType from "@mesg/api/lib/typedef/service";

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

export type IServiceGet = { lcd: API, instance?: IInstance, serviceHash?: string, service?: IService }
export const serviceGet: ListrTask<IServiceGet> = {
  title: 'Get service',
  task: async (ctx) => ctx.service = await ctx.lcd.service.get(ctx.serviceHash || ctx.instance.serviceHash)
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

export type IServiceDocGenerate = { definition: IService, markdownDoc?: string }
export const serviceDocGen: ListrTask<IServiceDocGenerate> = {
  title: 'Generate documentation',
  task: (ctx) => {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    registerHelper('toJSON', JSON.stringify)
    const template = readFileSync(join(__dirname, '..', 'assets', 'doc.md')).toString()
    ctx.markdownDoc = compile(template)(ctx.definition)
  }
}

export type IRunnerGet = { lcd: API, runnerHash: string, runner: IRunner }
export const runnerGet: ListrTask<IRunnerGet> = {
  title: 'Get runner',
  task: async (ctx) => {
    try {
      ctx.runner = await ctx.lcd.runner.get(ctx.runnerHash)
    } catch (err) {
      const hash = await resolveSIDRunner(ctx.lcd, ctx.runnerHash)
      ctx.runner = await ctx.lcd.runner.get(hash)
    }
  }
}

export type IInstanceGet = { lcd: API, runner?: IRunner, instanceHash?: string, instance: IInstance }
export const instanceGet: ListrTask<IInstanceGet> = {
  title: 'Get instance',
  task: async (ctx) => ctx.instance = await ctx.lcd.instance.get(ctx.instanceHash || ctx.runner.instanceHash)
}

export type IValidateTask = { service: IService, taskKey: string, task?: ServiceType.mesg.types.Service.ITask }
export type IValidateTasks = IRunnerGet | IInstanceGet | IServiceGet | IValidateTask
export const validateTask: ListrTask<IValidateTasks> = {
  title: 'Validate task',
  task: () => new Listr<IValidateTasks>([
    runnerGet,
    instanceGet,
    serviceGet,
    {
      title: 'Validate task',
      task: (ctx: IValidateTask) => {
        ctx.task = ctx.service.tasks.find(x => x.key === ctx.taskKey)
        if (!ctx.task) throw new Error(`The task ${ctx.taskKey} does not exist in service '${ctx.service.hash}'`)
      }
    }
  ])
}

export type IConvertInput = { task: ServiceType.mesg.types.Service.ITask, data: { [key: string]: any }, app: Application, inputs?: ExecutionType.mesg.protobuf.IStruct }
export const convertInput: ListrTask<IConvertInput> = {
  title: 'Convert inputs',
  task: ctx => {
    const convert = (type: 'Object' | 'String' | 'Boolean' | 'Number' | 'Any', value: string | any): any => {
      return {
        Object: (x: string | any) => typeof x === 'string' ? JSON.parse(x) : x,
        String: (x: string) => x,
        Boolean: (x: string) => ['true', 't', 'TRUE', 'T', '1'].includes(x),
        Number: (x: string) => parseFloat(x),
        Any: (x: string) => x,
      }[type](value)
    }
    const result = (ctx.task.inputs || [])
      .filter((x: any) => ctx.data[x.key] !== undefined && ctx.data[x.key] !== null)
      .reduce((prev: any, value: any) => ({
        ...prev,
        [value.key]: convert(value.type, ctx.data[value.key])
      }), {})
    ctx.inputs = ctx.app.encodeData(result || {})
  }
}

export type IExecute = { runner: IRunner, tags: string[], taskKey: string, inputs: ExecutionType.mesg.protobuf.IStruct, eventHash: string, app: Application, result?: IExecution }
export const execute: ListrTask<IExecute> = {
  title: 'Execute task',
  task: async (ctx: IExecute) => {
    ctx.result = await ctx.app.executeTaskAndWaitResult({
      eventHash: b58.decode(ctx.eventHash),
      executorHash: b58.decode(ctx.runner.hash),
      inputs: ctx.inputs,
      tags: ctx.tags,
      taskKey: ctx.taskKey
    })
  }
}