import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {readFileSync} from 'fs'

import Command, {Service} from '../../service-command'

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

  async run() {
    const {args, flags} = this.parse(ServiceExecute)

    const service = (await this.unaryCall('GetService', {serviceID: args.SERVICE})) as Service

    const inputs = this.convertValue(service, this.dataFromFlags(flags))

    const result = await this.mesg.executeTaskAndWaitResult({
      serviceID: args.SERVICE,
      taskKey: args.TASK,
      inputData: JSON.stringify(inputs),
      executionTags: [],
    })
    if (result.error) {
      return this.error(result.error)
    }
    this.log(`Result of task ${result.taskKey}: ${result.outputKey}`)
    cli.styledJSON(JSON.parse(result.outputData))
    return result
  }

  dataFromFlags(flags: {data: string[], json: string | undefined}): any {
    if (flags.json) {
      return JSON.parse(readFileSync(flags.json).toString())
    }
    return flags.data.reduce((acc, item) => {
      const [key, value] = item.split('=')
      return {
        ...acc,
        [key]: value
      }
    }, {})
  }

  convertValue(service: Service, data: any): any {
    // TODO
    this.log('', service)
    return data
  }
}
