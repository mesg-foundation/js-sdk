import Listr, { ListrTask } from "listr"
import { existsSync, mkdirSync, rmdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { safeLoad, safeDump } from "js-yaml"
import Account from "@mesg/api/lib/account-lcd"
import { hasImage, fetchImageTag, createService, listServices, waitForEvent } from "../utils/docker"
import { isRunning, waitToBeReady } from "../utils/lcd"
import merge from "lodash.merge"

const loadYaml = (file: string) => existsSync(file)
  ? safeLoad(readFileSync(file).toString())
  : {}

const pidFilename = 'pid.json'

const pids = (path: string): number[] => existsSync(join(path, pidFilename))
  ? JSON.parse(readFileSync(join(path, pidFilename)).toString()).map((x: any) => parseInt(x, 10))
  : []

const appendPID = (path: string) => {
  const res = [...pids(path), process.pid].filter((value, index, self) => self.indexOf(value) === index)
  writeFileSync(join(path, pidFilename), JSON.stringify(res))
}

const removePID = (path: string) => {
  if (!existsSync(join(path, pidFilename))) return
  const res = pids(path).filter(x => x !== process.pid)
  writeFileSync(join(path, pidFilename), JSON.stringify(res))
}

const hasOtherInstances = (path: string) => pids(path).filter(x => x !== process.pid).length > 0

export type ICreateConfig = { configDir: string }
export const createConfig: ListrTask<ICreateConfig> = {
  title: 'Creating default configuration',
  skip: (ctx) => existsSync(ctx.configDir),
  task: (ctx) => mkdirSync(ctx.configDir)
}

export type IClearConfig = { configDir: string }
export const clearConfig: ListrTask<IClearConfig> = {
  title: 'Clearing config',
  skip: ctx => hasOtherInstances(ctx.configDir),
  task: ctx => (rmdirSync as any)(ctx.configDir, { recursive: true })
}

export type IGenerateAccount = { mnemonic?: string, configDir: string, configFile: string }
export const generateAccount: ListrTask<IGenerateAccount> = {
  title: 'Generating test account',
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
  title: 'Updating the Engine image',
  skip: async (ctx) => !ctx.pull && await hasImage(ctx.image),
  task: (ctx) => fetchImageTag(ctx.image, ctx.tag)
}

export type IStartEngine = { configDir: string, configFile: string, mnemonic: string, image: string }
export const startEngine: ListrTask<IStartEngine> = {
  title: 'Starting the Engine',
  skip: async () => (await listServices({ name: ['engine'] })).length > 0,
  task: (ctx) => {
    const configFile = join(ctx.configDir, ctx.configFile)
    const newConfigs = merge({}, loadYaml(configFile), {
      account: {
        mnemonic: ctx.mnemonic
      }
    })
    writeFileSync(configFile, safeDump(newConfigs))
    return createService(ctx.image, 'engine', ctx.configDir)
  }
}

export type ILCDApiReady = {}
export const lcdApiReady: ListrTask<ILCDApiReady> = {
  title: 'Waiting for the Engine to be ready',
  skip: () => isRunning(),
  task: () => waitToBeReady()
}

export type IStop = { configDir: string }
export const stop: ListrTask<IStop> = {
  title: 'Stop environment',
  task: () => new Listr<IStop | IClearConfig>([
    {
      title: 'Stopping the Engine',
      skip: (ctx) => hasOtherInstances(ctx.configDir),
      task: async () => {
        const services = await listServices({ name: ['engine'] })
        if (services.length === 0) throw new Error('Could not find a running Engine')
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
    },
    clearConfig,
    {
      title: 'Unregister CLI',
      task: (ctx: IClearConfig) => removePID(ctx.configDir)
    },
  ])
}

export type IStart = ICreateConfig | IGenerateAccount | IUpdateDockerImage | IStartEngine | ILCDApiReady
export const start: ListrTask<IStart> = {
  title: 'Start environment',
  task: () => new Listr<IStart>([
    createConfig,
    {
      title: 'Register CLI',
      task: (ctx: ICreateConfig) => appendPID(ctx.configDir)
    },
    generateAccount,
    updateDockerImage,
    startEngine,
    lcdApiReady
  ])
}
