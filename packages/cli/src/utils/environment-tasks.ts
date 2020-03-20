import Listr, { ListrTask } from "listr"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { hasImage, fetchImageTag, createService, listServices, waitForEvent } from "./docker"
import { getOrGenerateAccount, write, clear } from "./config"
import fetch from "node-fetch"

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
      skip: ctx => hasOtherInstances(ctx.configDir),
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
      skip: ctx => hasOtherInstances(ctx.configDir),
      task: ctx => clear(ctx.configDir)
    },
    {
      title: 'Unregistering CLI',
      task: ctx => removePID(ctx.configDir)
    },
  ])
}

export type IStart = { configDir: string, pull: boolean, image: string, tag: string, endpoint: string, mnemonic?: string }
export const start: ListrTask<IStart> = {
  title: 'Starting environment',
  task: () => new Listr([
    {
      title: 'Creating default configuration',
      skip: ctx => existsSync(ctx.configDir),
      task: ctx => mkdirSync(ctx.configDir)
    },
    {
      title: 'Registering CLI',
      task: ctx => appendPID(ctx.configDir)
    },
    {
      title: 'Generating test account',
      skip: ctx => ctx.mnemonic,
      task: ctx => ctx.mnemonic = getOrGenerateAccount(ctx.configDir)
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
        write(ctx.configDir, {
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
