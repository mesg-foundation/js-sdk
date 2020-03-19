import Listr, { ListrTask } from "listr"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"
import { hasImage, fetchImageTag, createService, listServices, waitForEvent } from "./docker"
import { getOrGenerateAccount, write, clear } from "./config"
import fetch from "node-fetch"

const isRunning = async (endpoint: string = `http://localhost:1317`): Promise<boolean> => {
  try {
    await fetch(`${endpoint}/node_info`)
    const { block } = await (await fetch(`${endpoint}/blocks/latest`)).json()
    return parseInt(block.header.height, 10) > 0
  } catch (e) {
    return false
  }
}

const waitToBeReady = async (endpoint?: string): Promise<void> => {
  if (await isRunning(endpoint)) return
  return new Promise(resolve => {
    setTimeout(() => waitToBeReady().then(resolve), 1000)
  })
}

export type IStop = { configDir: string }
export const stop: ListrTask<IStop> = {
  title: 'Stop environment',
  task: () => new Listr([
    {
      title: 'Stopping the Engine',
      task: async () => {
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
      },
    },
    {
      title: 'Clearing config',
      task: ctx => clear(ctx.configDir)
    }
  ])
}

export type IStart = { configDir: string, configFile: string, pull: boolean, image: string, tag: string, endpoint: string, mnemonic?: string }
export const start: ListrTask<IStart> = {
  title: 'Start environment',
  task: () => new Listr([
    {
      title: 'Creating default configuration',
      skip: ctx => existsSync(ctx.configDir),
      task: ctx => mkdirSync(ctx.configDir)
    },
    {
      title: 'Generating test account',
      skip: ctx => ctx.mnemonic,
      task: ctx => ctx.mnemonic = getOrGenerateAccount(ctx.configDir, ctx.configFile)
    },
    {
      title: 'Updating the Engine image',
      skip: async ctx => !ctx.pull && await hasImage(ctx.image),
      task: ctx => fetchImageTag(ctx.image, ctx.tag)
    },
    {
      title: 'Starting the Engine',
      skip: async () => (await listServices({ name: ['engine'] })).length > 0,
      task: ctx => {
        write(join(ctx.configDir, ctx.configFile), {
          account: {
            mnemonic: ctx.mnemonic
          }
        })
        return createService(ctx.image, 'engine', ctx.configDir)
      }
    },
    {
      title: 'Waiting for the Engine to be ready',
      skip: ctx => isRunning(ctx.endpoint),
      task: async ctx => waitToBeReady(ctx.endpoint)
    }
  ])
}