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
  title: 'Wait for API',
  skip: () => isRunning(),
  task: () => waitToBeReady()
}

export type IStop = {}
export const stop: ListrTask<IStop> = {
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

export type IStart = ICreateConfig | IGenerateAccount | IUpdateDockerImage | IStartEngine | ILCDApiReady
export const start: ListrTask<IStart> = {
  title: 'Start environment',
  task: () => new Listr<IStart>([
    createConfig,
    generateAccount,
    updateDockerImage,
    startEngine,
    lcdApiReady
  ])
}