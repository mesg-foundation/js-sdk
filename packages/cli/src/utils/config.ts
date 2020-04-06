import { existsSync, readFileSync, rmdirSync, writeFileSync } from "fs"
import { safeLoad, safeDump } from "js-yaml"
import { join } from "path"
import Account from "@mesg/api/lib/account"
import merge from "lodash.merge"

const FILE = 'config.yml'

export const clear = (path: string): void => {
  (rmdirSync as any)(path, { recursive: true })
}

export const read = (path: string): any => {
  return existsSync(join(path, FILE))
    ? safeLoad(readFileSync(join(path, FILE)).toString())
    : {}
}

export const write = (path: string, config: any) => {
  const newConfigs = merge({}, read(path), config)
  writeFileSync(join(path, FILE), safeDump(newConfigs))
}

export const getOrGenerateAccount = (path: string): string => {
  const configAccount = read(path).account || {}
  return configAccount.mnemonic
    ? configAccount.mnemonic
    : Account.generateMnemonic()
}