import Listr, { ListrTask } from "listr"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { hasImage, fetchImageTag, createContainer, listContainers, findNetwork, engineLabel, engineName } from "./docker"
import { generateConfig, clear, Config } from "./config"
import fetch from "node-fetch"
import API from "@mesg/api/lib/lcd"

const pidFilename = 'pid.json'
const image = 'mesg/engine'

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
        await container.stop()
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

export type IStart = { configDir: string, pull: boolean, version: string, endpoint: string, config?: Config }
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
      task: ctx => ctx.config = generateConfig(ctx.configDir)
    },
    {
      title: 'Updating the Engine image',
      skip: async ctx => !ctx.pull && await hasImage(`${image}:${ctx.version}`),
      task: ctx => fetchImageTag(image, ctx.version)
    },
    {
      title: 'Starting the Engine',
      skip: async ctx => await isRunning(ctx.endpoint) || (await listContainers({ label: [engineLabel] })).length > 0,
      task: ctx => createContainer(`${image}:${ctx.version}`, ctx.configDir)
    },
    {
      title: 'Waiting for the Engine to be ready',
      skip: ctx => isRunning(ctx.endpoint),
      task: async ctx => waitToBeReady(ctx.endpoint)
    },
    {
      title: 'Ensure balance',
      task: async ctx => {
        const api = new API(ctx.endpoint)
        const engineAccount = await api.account.import(ctx.config.engine.account.mnemonic)
        const userAccount = await api.account.import(ctx.config.mnemonic)
        const userBalance = userAccount.coins.find(x => x.denom === 'atto')
        if (userBalance && parseInt(userBalance.amount, 10) > 1000) return
        const transferMsg = api.account.transferMsg(engineAccount.address, userAccount.address, [{
          amount: 1e18.toString(),
          denom: 'atto'
        }])
        const tx = await api.createTransaction([transferMsg], engineAccount)
        await api.broadcast(tx.signWithMnemonic(ctx.config.engine.account.mnemonic), "block")
      }
    }
  ])
}
