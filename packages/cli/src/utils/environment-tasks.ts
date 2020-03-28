import Listr, { ListrTask } from "listr"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { hasImage, fetchImageTag, createContainer, listContainers, findNetwork, engineLabel, engineName } from "./docker"
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
  title: 'Stopping environment',
  task: () => new Listr([
    {
      title: 'Stopping the Engine',
      skip: ctx => hasOtherInstances(ctx.configDir),
      task: async () => {
        const containers = await listContainers({ label: [engineLabel] })
        if (containers.length === 0) throw new Error('Cannot find engine')
        const container = containers[0]
        await container.stop({
          "t": 60, // tell docker to wait for the container to stop gracefully within 60sec.
        })
        await container.delete()
        const network = await findNetwork(engineName)
        if (network) await network.remove()
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
      task: ctx => mkdirSync(ctx.configDir, { recursive: true })
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
      skip: async () => (await listContainers({ label: [engineLabel] })).length > 0,
      task: ctx => {
        write(ctx.configDir, {
          account: {
            mnemonic: ctx.mnemonic
          }
        })
        return createContainer(ctx.image, ctx.configDir)
      }
    },
    {
      title: 'Waiting for the Engine to be ready',
      skip: ctx => isRunning(ctx.endpoint),
      task: async ctx => waitToBeReady(ctx.endpoint)
    }
  ])
}
