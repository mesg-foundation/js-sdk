import { flags } from '@oclif/command'
import { readFileSync } from 'fs'

import Command from '../../root-command'

import ServiceGet from '../service/get'
import InstanceGet from '../instance/get'
import { ExecutionCreateOutputs } from 'mesg-js/lib/api';

export default class ExecutionCreate extends Command {
  static description = 'describe the command here'

  static flags = {
    ...Command.flags,
    json: flags.string({ char: 'j', description: 'Path to a JSON file containing the data required to run the task' }),
    data: flags.string({
      char: 'd',
      description: 'data required to run the task',
      multiple: true,
      helpValue: 'key=value'
    }),
  }

  static args = [{
    name: 'INSTANCE',
    required: true,
    description: 'Hash or Sid'
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  async run(): ExecutionCreateOutputs {
    const { args, flags } = this.parse(ExecutionCreate)

    const instance = await InstanceGet.run([args.INSTANCE, '--silent'])
    const service = await ServiceGet.run([instance.serviceHash, '--silent'])

    const task = service.tasks.find((x: any) => x.key === args.TASK)
    if (!task) {
      throw new Error(`The task ${args.TASK} does not exists in the instance ${args.INSTANCE}`)
    }
    const inputs = this.convertValue(task.inputs, this.dataFromFlags(flags))

    const result = await this.execute({
      inputs: JSON.stringify(inputs),
      instanceHash: args.INSTANCE,
      tags: ['CLI'],
      taskKey: args.TASK
    })
    this.log(`Result of task ${args.TASK}`)
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
