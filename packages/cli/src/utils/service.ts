import { IService } from "@mesg/api/lib/service-lcd"
import deployer, { createTar } from "./deployer"
import { readFileSync } from "fs"
import { join } from "path"
import { service as serviceCompiler } from '@mesg/compiler'
import API from "@mesg/api/lib/lcd"
import { findHash } from "@mesg/api/lib/util/txevent"

export const compile = async (path: string, ipfsClient: any): Promise<IService> => {
  const deployedPath = await deployer(path)
  const service = await serviceCompiler(readFileSync(join(deployedPath, 'mesg.yml')))
  const buffer: any[] = []
  service.source = await new Promise<string>((resolve, reject) => {
    createTar(join(deployedPath))
      .on('data', (data: any) => buffer.push(...data))
      .once('error', reject)
      .on('end', async () => {
        const res = await ipfsClient.add(Buffer.from(buffer), { pin: true })
        if (!res.length) {
          return reject(new Error('pushing service manifest failed'))
        }
        return resolve(res[0].hash)
      })
  })
  return service
}

export const create = async (lcd: API, definition: IService, mnemonic: string): Promise<IService> => {
  const hash = await lcd.service.hash(definition)
  if (await lcd.service.exists(hash)) return lcd.service.get(hash)
  const account = await lcd.account.import(mnemonic)
  const tx = await lcd.createTransaction(
    [lcd.service.createMsg(account.address, definition)],
    account
  )
  const txResult = await lcd.broadcast(tx.signWithMnemonic(mnemonic))
  const hashes = findHash(txResult, "Service")
  if (hashes.length != 1) throw new Error('error while getting the hash of the service created')
  return lcd.service.get(hashes[0])
}
