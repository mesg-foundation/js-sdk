import Command from './root-command'
import services from './services'

export interface ServiceID {
  sid: string
  hash: string
}

export interface Service {
  definition: Definition
  status: number
}

export interface Definition {
  sid: string
  name: string
  description: string
  tasks: Task[]
  events: Event[]
  dependencies: Dependency[]
  configuration: Dependency
  repository: string
  source: string
}

export interface Task {
  key: string
  name: string
  description: string
  inputs: Parameter[]
  outputs: Parameter[]
}

export interface Event {
  key: string
  name: string
  description: string
  data: Parameter[]
}

export interface Dependency {
  key: string
  image: string
  volumes: string[]
  volumesFrom: string[]
  ports: string[]
  command: string
  args: string[]
  env: string[]
}

export interface Parameter {
  name: string
  description: string
  type: string
  optional: boolean
  repeated: boolean
  object: Parameter[]
}

export type SERVICE_PARAMETER_TYPE = 'String' | 'Number' | 'Boolean' | 'Object' | 'Any'

export interface ServiceInfo {
  sid: string
  source: string
  type: string
}

export default abstract class extends Command {
  static flags = {
    ...Command.flags
  }

  status(s: number) {
    return ['unknown', 'stopped', 'starting', 'partial', 'running'][s]
  }

  async getAuthorizedServiceInfo(id: string, versionHash: string): ServiceInfo {
    const list = await this.executeAndCaptureError(services.account.id, services.account.tasks.list)
    const {addresses} = list.data
    this.require(addresses.length > 0, 'you have no accounts. please add an authorized account in order to deploy this service')
    const res = await this.executeAndCaptureError(services.marketplace.id, services.marketplace.tasks.isAuthorized, {
      id,
      versionHash,
      addresses
    })
    const {authorized, sid, source, type} = res.data
    this.require(authorized, 'you have no authorized accounts. please add an authorized account in order to deploy this service')
    return {sid, source, type}
  }
}
