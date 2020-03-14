import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs"
import { safeLoad, safeDump } from 'js-yaml'
import merge from 'lodash.merge'
import Account from '@mesg/api/lib/account-lcd'
import { join } from "path"
import Listr from "listr"
import { hasImage, fetchImageTag, createService } from "./docker"
import { isRunning, waitToBeReady } from "./lcd"

const IMAGE_NAME = 'mesg/engine'

const readEngineConfig = (configPath: string) => existsSync(configPath)
  ? safeLoad(readFileSync(configPath).toString())
  : {}

type Context = {
  mnemonic?: string;
  image: string;
}

export default async (tag: string, pull: boolean = false): Promise<Context> => {
  const directory = join(process.cwd(), '.mesg')
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true })
  const configPath = join(directory, 'config.yml')

  const tasks = new Listr([
    {
      title: 'Generate test account',
      skip: (ctx: Context) => ctx.mnemonic,
      task: (ctx: Context, task) => {
        ctx.mnemonic = Account.generateMnemonic()
        task.output = ctx.mnemonic
      }
    },
    {
      title: 'Update engine image',
      skip: async (ctx: Context) => !pull && await hasImage(ctx.image),
      task: () => fetchImageTag(IMAGE_NAME, tag)
    },
    {
      title: 'Start engine',
      skip: () => isRunning(),
      task: (ctx) => {
        writeFileSync(configPath, safeDump(merge({}, readEngineConfig(configPath), {
          account: {
            mnemonic: ctx.mnemonic
          }
        })))
        return createService(ctx.image, 'engine', directory)
      }
    },
    {
      title: 'Wait for API',
      skip: () => isRunning(),
      task: () => waitToBeReady()
    }
  ])
  return tasks.run({
    mnemonic: (readEngineConfig(configPath).account || {}).mnemonic,
    image: `${IMAGE_NAME}:${tag}`
  })
}