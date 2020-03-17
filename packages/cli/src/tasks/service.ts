import { IService } from "@mesg/api/lib/service-lcd"
import { ListrTask } from "listr"
import deployer, { createTar } from "../utils/deployer"
import { readFileSync } from "fs"
import { join } from "path"
import { service as serviceCompiler } from '@mesg/compiler'
import API from "@mesg/api/lib/lcd"
import { findHash } from "../utils/txevent"
import { IInstance } from "@mesg/api/lib/instance-lcd"
import { registerHelper, compile as compileTemplate } from "handlebars"

export type ICompile = { path: string, ipfsClient: any, service?: IService }
export const compile: ListrTask<ICompile> = {
  title: 'Compile service',
  task: async (ctx) => {
    const path = await deployer(ctx.path)
    const service = await serviceCompiler(readFileSync(join(path, 'mesg.yml')))
    const buffer: any[] = []
    service.source = await new Promise<string>((resolve, reject) => {
      createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => {
          const res = await ctx.ipfsClient.add(Buffer.from(buffer), { pin: true })
          if (!res.length) {
            return reject(new Error('pushing service manifest failed'))
          }
          return resolve(res[0].hash)
        })
    })
    ctx.service = service
  }
}

export type ICreate = { lcd: API, service: IService, mnemonic: string, serviceHash?: string }
export const create: ListrTask<ICreate> = {
  title: 'Create service',
  skip: async (ctx) => {
    const hash = await ctx.lcd.service.hash(ctx.service)
    if (await ctx.lcd.service.exists(hash)) {
      ctx.serviceHash = hash
      return hash as any
    }
    return ''
  },
  task: async (ctx) => {
    const account = await ctx.lcd.account.import(ctx.mnemonic)
    const tx = await ctx.lcd.createTransaction(
      [ctx.lcd.service.createMsg(account.address, ctx.service)],
      account
    )
    const txResult = await ctx.lcd.broadcast(tx.signWithMnemonic(ctx.mnemonic))
    const hashes = findHash(txResult, "service", "CreateService")
    if (hashes.length != 1) throw new Error('error while getting the hash of the service created')
    ctx.serviceHash = hashes[0]
  }
}

export type IGet = { lcd: API, instance?: IInstance, serviceHash?: string, service?: IService }
export const get: ListrTask<IGet> = {
  title: 'Get service',
  task: async (ctx) => ctx.service = await ctx.lcd.service.get(ctx.serviceHash || ctx.instance.serviceHash)
}

export type IGenDock = { service: IService, markdownDoc?: string }
export const genDoc: ListrTask<IGenDock> = {
  title: 'Generate documentation',
  task: (ctx) => {
    registerHelper('or', (a: any, b: any) => a ? a : b)
    registerHelper('toJSON', JSON.stringify)
    const template = readFileSync(join(__dirname, '..', 'assets', 'doc.md')).toString()
    ctx.markdownDoc = compileTemplate(template)(ctx.service)
  }
}
