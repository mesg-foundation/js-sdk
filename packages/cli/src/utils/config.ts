import { existsSync, readFileSync, rmdirSync, writeFileSync, unlinkSync } from "fs"
import { safeLoad, safeDump } from "js-yaml"
import { join } from "path"
import Account from "@mesg/api/lib/account-lcd"

export type Config = {
  engine: {
    account: {
      mnemonic: string
    }
  }
  mnemonic: string
}

const ENGINE_FILE = 'config.yml'
const CLI_FILE = '.mesgrc'

export const clear = (path: string): void => {
  const rm = rmdirSync as any
  rm(join(path, 'cosmos'), { recursive: true })
  rm(join(path, 'tendermint'), { recursive: true })
  unlinkSync(join(path, ENGINE_FILE))
  unlinkSync(join(path, CLI_FILE))
}

const read = (filepath: string): Config => {
  return existsSync(filepath)
    ? safeLoad(readFileSync(filepath).toString())
    : {}
}

const write = (path: string, config: Config): Config => {
  writeFileSync(join(path, CLI_FILE), safeDump(config))
  writeFileSync(join(path, ENGINE_FILE), safeDump(config.engine))
  return config
}

export const hasTestAccount = (path: string): boolean => {
  const config = read(join(path, CLI_FILE))
  return !!config.mnemonic && !!config.engine.account.mnemonic
}

export const generateConfig = (path: string): Config => {
  const mnemonic = Account.generateMnemonic()
  const config = {
    engine: {
      account: {
        mnemonic: Account.generateMnemonic()
      }
    },
    mnemonic
  }
  return write(path, config)
}