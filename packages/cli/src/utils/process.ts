import { IProcess, IDefinition } from "@mesg/api/lib/process-lcd"
import LCD from '@mesg/api/lib/lcd'
import { process as compileProcess } from '@mesg/compiler'
import { readFileSync } from "fs"
import * as Service from './service'
import * as Runner from './runner'
import { findHash } from "@mesg/api/lib/util/txevent"
import { RunnerInfo } from "@mesg/runner"
import { IsAlreadyExistsError } from "./error"

export type CompilationResult = {
  definition: IDefinition,
  runners: RunnerInfo[]
}

export const compile = async (processFilePath: string, ipfsClient: any, lcd: LCD, lcdEndpoint: string, mnemonic: string, env: string[] = []): Promise<CompilationResult> => {
  const runners: RunnerInfo[] = []
  const instanceReolver = async (instanceObject: any): Promise<string> => {
    if (!instanceObject.instanceHash && !instanceObject.instance) throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
    if (instanceObject.instanceHash) return instanceObject.instanceHash
    const { src, env } = instanceObject.instance
    const definition = await Service.compile(src, ipfsClient)
    const service = await Service.create(lcd, definition, mnemonic)
    const runner = await Runner.create(lcdEndpoint, mnemonic, service.hash, env)
    if (!runners.find(x => x.hash === runner.hash)) runners.push(runner)
    return runner.instanceHash
  }


  const definition = await compileProcess(readFileSync(processFilePath), instanceReolver, env.reduce((prev, env) => ({
    ...prev,
    [env.split('=')[0]]: env.split('=')[1],
  }), {}))
  return {
    definition,
    runners
  }
}

export const create = async (lcd: LCD, process: IDefinition, mnemonic: string): Promise<IProcess> => {
  try {
    const account = await lcd.account.import(mnemonic)
    const tx = await lcd.createTransaction(
      [lcd.process.createMsg(account.address, process)],
      account
    )
    const txResult = await lcd.broadcast(tx.signWithMnemonic(mnemonic))
    const hashes = findHash(txResult, "Process")
    if (hashes.length != 1) throw new Error('error while getting the hash of the process created')
    return lcd.process.get(hashes[0])
  } catch (e) {
    if (!IsAlreadyExistsError.match(e)) throw e
    const hash = new IsAlreadyExistsError(e).hash
    return lcd.process.get(hash)
  }
}

export const remove = async (lcd: LCD, process: IProcess, mnemonic: string): Promise<void> => {
  const account = await lcd.account.import(mnemonic)
  const tx = await lcd.createTransaction(
    [lcd.process.deleteMsg(account.address, process.hash)],
    account
  )
  await lcd.broadcast(tx.signWithMnemonic(mnemonic))
  return
}
