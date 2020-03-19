import { IProcess } from "@mesg/api/lib/process-lcd"
import LCD from '@mesg/api/lib/lcd'
import API from '@mesg/api'
import { process as compileProcess } from '@mesg/compiler'
import { readFileSync } from "fs"
import * as Service from './service'
import * as Runner from './runner'
import { findHash } from "./txevent"

export const compile = async (processFilePath: string, ipfsClient: any, lcd: LCD, grpc: API, mnemonic: string, env: string[] = []): Promise<IProcess> => {
  const instanceReolver = async (instanceObject: any): Promise<string> => {
    if (!instanceObject.instanceHash && !instanceObject.instance) throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
    if (instanceObject.instanceHash) return instanceObject.instanceHash
    const { src, env } = instanceObject.instance
    const definition = await Service.compile(src, ipfsClient)
    const service = await Service.create(lcd, definition, mnemonic)
    const runner = await Runner.create(grpc, lcd, service.hash, env)
    return runner.instanceHash
  }

  return compileProcess(readFileSync(processFilePath), instanceReolver, env.reduce((prev, env) => ({
    ...prev,
    [env.split('=')[0]]: env.split('=')[1],
  }), {}))
}

export const create = async (lcd: LCD, process: IProcess, mnemonic: string): Promise<IProcess> => {
  const account = await lcd.account.import(mnemonic)
  const tx = await lcd.createTransaction(
    [lcd.process.createMsg(account.address, process)],
    account
  )
  const txResult = await lcd.broadcast(tx.signWithMnemonic(mnemonic))
  const hashes = findHash(txResult, "process", "CreateProcess")
  if (hashes.length != 1) throw new Error('error while getting the hash of the process created')
  return lcd.process.get(hashes[0])
}
