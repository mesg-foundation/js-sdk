import {readFileSync} from 'fs'

import Command from '../../root-command'
import * as compile from '../../utils/compiler'
import ServiceStart from '../service/start';

export default class WorkflowCompile extends Command {
  static description = 'Compile a workflow'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'WORKFLOW_FILE',
    description: 'Path of a workflow file'
  }]

  async run(): Promise<any> {
    const {args} = this.parse(WorkflowCompile)
    const definition = await compile.workflow(readFileSync(args.WORKFLOW_FILE), async (instanceObject: any) => {
      if (instanceObject.instanceHash) {
        return instanceObject.instanceHash
      }
      if (instanceObject.service) {
        return this.serviceToInstance(instanceObject.service)
      }
      throw new Error('at least one of the following parameter should be set: "instanceHash" or "service"')
    })
    this.styledJSON(definition)
    this.spinner.stop()
    return definition
  }

  async serviceToInstance(key: string): Promise<string> {
    const {services} = await this.api.service.list({})
    if (!services) throw new Error('no services deployed, please deploy your service first')
    const match = services.filter(x => x.hash === key || x.sid === key)
    if (!match || match.length === 0) throw new Error(`cannot find any service with the following key: ${key}`)
    if (match.length > 1) throw new Error(`multiple services match the following sid: ${key}, provide a service's hash instead`)
    const service = match[0]
    if (!service.hash) throw new Error('invalid service')
    const {instances} = await this.api.instance.list({serviceHash: service.hash})
    if (!instances || instances.length === 0) {
      const instance = await ServiceStart.run([service.hash, '--silent'])
      return instance.hash
    }
    if (instances.length > 1) throw new Error('multiple instances match the service, use parameter "instanceHash" instead of "service"')
    const instance = instances[0]
    if (!instance.hash) throw new Error('invalid instance')
    return instance.hash
  }
}
