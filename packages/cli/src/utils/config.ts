import { existsSync, readFileSync, rmdirSync, writeFileSync } from "fs"
import { safeLoad, safeDump } from "js-yaml"
import { join } from "path"
import Account from "@mesg/api/lib/account-lcd"
import merge from "lodash.merge"

export const clear = (dir: string): void => {
  (rmdirSync as any)(dir, { recursive: true })
}

export const read = (path: string): any => {
  return existsSync(path)
    ? safeLoad(readFileSync(path).toString())
    : {}
}

export const write = (path: string, config: any) => {
  const newConfigs = merge({}, read(path), config)
  writeFileSync(path, safeDump(newConfigs))
}

export const getOrGenerateAccount = (configDir: string, configFile: string): string => {
  const configAccount = read(join(configDir, configFile)).account || {}
  return configAccount.mnemonic
    ? configAccount.mnemonic
    : Account.generateMnemonic()
}