import { IProcess } from "@mesg/api/lib/process-lcd"
import Listr, { ListrTask } from "listr"
import LCD from '@mesg/api/lib/lcd'
import API from '@mesg/api'
import { process as compileProcess } from '@mesg/compiler'
import { readFileSync } from "fs"
import * as Service from './service'
import * as Runner from './runner'

export type ICompile = { processFilePath: string, ipfsClient: any, lcd: LCD, grpc: API, mnemonic: string, env: string[], process?: IProcess }
export const compile: ListrTask<ICompile> = {
  title: 'Compile process',
  task: async (ctx, task) => {
    const title = task.title
    ctx.process = await compileProcess(readFileSync(ctx.processFilePath), async (instanceObject: any): Promise<string> => {
      if (!instanceObject.instanceHash && !instanceObject.instance) throw new Error('"instanceHash" or "instance" not found in the process\'s definition')
      if (instanceObject.instanceHash) return instanceObject.instanceHash

      const { src, env } = instanceObject.instance

      task.title = `${title} - Deploying and starting ${src}`
      const tasks = new Listr<Service.ICompile | Service.ICreate | Runner.ICreate>([
        Service.compile,
        Service.create,
        Runner.create
      ], { renderer: 'silent' })
      const res = await tasks.run({
        env: env,
        grpc: ctx.grpc,
        ipfsClient: ctx.ipfsClient,
        lcd: ctx.lcd,
        mnemonic: ctx.mnemonic,
        path: src,
      })
      return (res as Runner.ICreate).instanceHash
    }, (ctx.env || []).reduce((prev, env) => ({
      ...prev,
      [env.split('=')[0]]: env.split('=')[1],
    }), {}))
    task.title = title
  }
}
