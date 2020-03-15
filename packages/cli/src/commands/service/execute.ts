import { flags } from '@oclif/command'
import { readFileSync } from 'fs'
import { ExecutionCreateOutputs } from '@mesg/api/lib/execution'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import { resolveSIDRunner } from '@mesg/api/lib/util/resolve'
import { cli } from 'cli-ux'
import { hash } from '@mesg/api/lib/types'

export default class ServiceExecute extends Command {
  static description = 'Execute a task on a running service'

  static flags = {
    ...Command.flags,
    json: flags.string({ char: 'j', description: 'Path to a JSON file containing the task inputs' }),
    data: flags.string({
      char: 'd',
      description: 'Task inputs',
      multiple: true,
      helpValue: 'key=value'
    }),
    eventHash: flags.string({
      description: 'Event hash to create the execution with'
    }),
  }

  static args = [{
    name: 'RUNNER_HASH',
    required: true,
    description: 'The hash of the runner that will execute this execution'
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  async run(): ExecutionCreateOutputs {
    const { args, flags } = this.parse(ServiceExecute)

    const runnerHash = await this.runnerResolver(args.RUNNER_HASH)

    const runner = await this.lcd.runner.get(runnerHash)
    if (!runner.instanceHash) { throw new Error('invalid runner hash') }

    const instance = await this.lcd.instance.get(runner.instanceHash)
    if (!instance.serviceHash) { throw new Error('invalid instance') }

    const service = await this.lcd.service.get(instance.serviceHash)
    if (!service.hash) { throw new Error('invalid service') }

    const task = service.tasks.find(x => x.key === args.TASK)
    if (!task) {
      throw new Error(`The task ${args.TASK} does not exist in service '${service.hash}'`)
    }

    const result = await this.execute({
      inputs: this.convertValue(task.inputs, this.dataFromFlags(flags)),
      executorHash: base58.decode(runnerHash),
      tags: ['CLI'],
      taskKey: args.TASK,
      eventHash: base58.decode(flags.eventHash || '6aUPZhmnFKiSsHXRaddbnqsKKi9KogbQNiKUcpivaohb'), // TODO: to improve
    })
    cli.styledJSON(result)
    return result
  }

  async runnerResolver(sidOrHash: string): Promise<string> {
    try {
      await this.lcd.runner.get(sidOrHash)
      return sidOrHash
    } catch (err) {
      return resolveSIDRunner(this.lcd, sidOrHash)
    }
  }

  async execute(request: { executorHash: hash, taskKey: string, eventHash: hash, inputs?: { [key: string]: any }, tags?: string[] }): Promise<{ [key: string]: any }> {
    const exec = await this._app.executeTaskAndWaitResult({
      executorHash: request.executorHash,
      tags: request.tags || [],
      taskKey: request.taskKey,
      inputs: this._app.encodeData(request.inputs || {}),
      eventHash: request.eventHash,
    })
    if (exec.error) throw new Error(exec.error)
    if (!exec.outputs) throw new Error('missing outputs')
    return this._app.decodeData(exec.outputs)
  }

  dataFromFlags(flags: { data: string[], json: string | undefined }): any {
    if (flags.json) {
      return JSON.parse(readFileSync(flags.json).toString())
    }
    return (flags.data || []).reduce((acc, item) => {
      const [key, value] = item.split('=')
      return {
        ...acc,
        [key]: value
      }
    }, {})
  }

  convertValue(inputs: any, data: any): any {
    if (!inputs) return {}
    return inputs
      .filter((x: any) => data[x.key] !== undefined && data[x.key] !== null)
      .reduce((prev: any, value: any) => ({
        ...prev,
        [value.key]: this.convert(value.type, data[value.key])
      }), {})
  }

  convert(type: 'Object' | 'String' | 'Boolean' | 'Number' | 'Any', value: string | any): any {
    try {
      return {
        Object: (x: string | any) => typeof x === 'string' ? JSON.parse(x) : x,
        String: (x: string) => x,
        Boolean: (x: string) => ['true', 't', 'TRUE', 'T', '1'].includes(x),
        Number: (x: string) => parseFloat(x),
        Any: (x: string) => x,
      }[type](value)
    } catch {
      this.warn(`Cannot parse ${value} in ${type}`)
      return value
    }
  }
}
