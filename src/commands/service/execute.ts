import {flags} from '@oclif/command'
import {readFileSync} from 'fs'

import {ExecutionResult} from '../../root-command'
import Command, {Service, SERVICE_PARAMETER_TYPE} from '../../service-command'

import Detail from './detail'

export default class ServiceExecute extends Command {
  static description = 'describe the command here'

  static aliases = ['service:exec']

  static flags = {
    ...Command.flags,
    json: flags.string({char: 'j', description: 'Path to a JSON file containing the data required to run the task'}),
    data: flags.string({
      char: 'd',
      description: 'data required to run the task',
      multiple: true,
      helpValue: 'FOO=BAR'
    }),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  async run(): Promise<ExecutionResult | null> {
    const {args, flags} = this.parse(ServiceExecute)

    const service = (await Detail.run([args.SERVICE, '--silent']))[0] as Service

    const task = service.definition.tasks.find((x: any) => x.key === args.TASK)
    if (!task) {
      this.error(`The task ${args.TASK} does not exists in the service ${args.SERVICE}`)
      return null
    }
    const inputs = this.convertValue(task.inputs, this.dataFromFlags(flags))

    const result = await this.executeAndCaptureError(service.definition.hash, args.TASK, inputs)
    this.log(`Result of task ${args.TASK}`)
    this.styledJSON(result.data)
    return result
  }

  dataFromFlags(flags: {data: string[], json: string | undefined}): any {
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

  convert(type: SERVICE_PARAMETER_TYPE, value: string | any): any {
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
