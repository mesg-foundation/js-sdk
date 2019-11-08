import {flags} from '@oclif/command'
import {readFileSync} from 'fs'
import {ExecutionCreateOutputs} from '@mesg/api'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import instanceResolver from '../../utils/instance-resolver'

import ServiceDetail from './detail'

export default class ServiceExecute extends Command {
  static description = 'Execute a task on a running service'

  static flags = {
    ...Command.flags,
    json: flags.string({char: 'j', description: 'Path to a JSON file containing the task inputs'}),
    data: flags.string({
      char: 'd',
      description: 'Task inputs',
      multiple: true,
      helpValue: 'key=value'
    }),
  }

  static args = [{
    name: 'INSTANCE_HASH',
    required: true,
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  async run(): ExecutionCreateOutputs {
    const {args, flags} = this.parse(ServiceExecute)

    const instanceHash = await instanceResolver(this.api, args.INSTANCE_HASH)

    const instance = await this.api.instance.get({
      hash: instanceHash
    })
    if (!instance.serviceHash) { throw new Error('invalid service hash') }
    const service = await ServiceDetail.run([base58.encode(instance.serviceHash), '--silent', ...this.flagsAsArgs(flags)])

    const task = service.tasks.find((x: any) => x.key === args.TASK)
    if (!task) {
      throw new Error(`The task ${args.TASK} does not exist in service`)
    }
    const inputs = this.convertValue(task.inputs, this.dataFromFlags(flags))

    const result = await this.execute({
      inputs,
      instanceHash,
      tags: ['CLI'],
      taskKey: args.TASK
    })
    this.styledJSON(result)
    return result
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
