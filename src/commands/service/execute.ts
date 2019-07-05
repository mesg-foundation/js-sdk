import {flags} from '@oclif/command'
import {readFileSync} from 'fs'
import {ExecutionCreateOutputs} from 'mesg-js/lib/api'

import Command from '../../root-command'

import ServiceDetail from './detail'

export default class ServiceExecute extends Command {
  static description = 'Execute a task on a specific service\'s instance'

  static flags = {
    ...Command.flags,
    json: flags.string({char: 'j', description: 'Path to a JSON file containing the data required to run the task'}),
    data: flags.string({
      char: 'd',
      description: 'data required to run the task',
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

    const instance = await this.api.instance.get({hash: args.INSTANCE_HASH})
    const service = await ServiceDetail.run([instance.serviceHash, '--silent'])

    const task = service.tasks.find((x: any) => x.key === args.TASK)
    if (!task) {
      throw new Error(`The task ${args.TASK} does not exists in the instance ${args.INSTANCE_HASH}`)
    }
    const inputs = this.convertValue(task.inputs, this.dataFromFlags(flags))

    const result = await this.execute({
      inputs: JSON.stringify(inputs),
      instanceHash: args.INSTANCE_HASH,
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
      .filter((x: any) => !!data[x.key])
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
