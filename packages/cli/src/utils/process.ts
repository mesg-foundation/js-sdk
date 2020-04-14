import { IProcess, IDefinition } from "@mesg/api/lib/process"
import LCD from '@mesg/api'
import { process as compileProcess } from '@mesg/compiler'
import { readFileSync } from "fs"
import { findHash } from "@mesg/api/lib/util/txevent"
import { RunnerInfo } from "@mesg/runner"
import { IsAlreadyExistsError } from "./error"

export type CompilationResult = {
  definition: IDefinition,
  runners: RunnerInfo[]
}

export const compile = async (processFilePath: string, env: string[], instanceResolver: (definition: { src: string, env: string[] }) => Promise<RunnerInfo>): Promise<CompilationResult> => {
  const runners: RunnerInfo[] = []

  const definition = await compileProcess(
    readFileSync(processFilePath),
    async definition => {
      if (!definition.instanceHash && !definition.instance) throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
      if (definition.instanceHash) return definition.instanceHash
      const runner = await instanceResolver(definition.instance)
      if (!runners.find(x => x.hash === runner.hash)) runners.push(runner)
      return runner.instanceHash
    },
    env.reduce((prev, env) => ({
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

export const remove = async (lcd: LCD, processHash: string, mnemonic: string): Promise<void> => {
  const account = await lcd.account.import(mnemonic)
  const tx = await lcd.createTransaction(
    [lcd.process.deleteMsg(account.address, processHash)],
    account
  )
  await lcd.broadcast(tx.signWithMnemonic(mnemonic))
  return
}
