import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { safeLoad, safeDump } from 'js-yaml'
import merge from 'lodash.merge'
import Account from '@mesg/api/lib/account-lcd'
import Listr from "listr"
import { hasImage, fetchImageTag, createService } from "./docker"
import { isRunning, waitToBeReady } from "./lcd"
import { join } from "path"

const loadYaml = (file: string) => existsSync(file)
  ? safeLoad(readFileSync(file).toString())
  : {}

export type Context = {
  // Account
  mnemonic?: string;
  // Config
  configDir: string;
  configFile: string;
  // Docker
  pull?: boolean;
  image: string;
  tag: string;
}

export default new Listr<Context>([
  {
    title: 'Create default configuration',
    skip: (ctx) => existsSync(ctx.configDir),
    task: (ctx) => mkdirSync(ctx.configDir, { recursive: true })
  },
  {
    title: 'Generate test account',
    skip: (ctx) => {
      if (!ctx.mnemonic)
        ctx.mnemonic = (loadYaml(join(ctx.configDir, ctx.configFile)).account || {}).mnemonic
      return ctx.mnemonic
    },
    task: (ctx, task) => {
      ctx.mnemonic = Account.generateMnemonic()
      task.output = ctx.mnemonic
    }
  },
  {
    title: 'Update engine image',
    skip: async (ctx) => !ctx.pull && await hasImage(ctx.image),
    task: (ctx) => fetchImageTag(ctx.image, ctx.tag)
  },
  {
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
      return createService(ctx.image, 'engine', ctx.configDir)
    }
  },
  {
    title: 'Wait for API',
    skip: () => isRunning(),
    task: () => waitToBeReady()
  }
])