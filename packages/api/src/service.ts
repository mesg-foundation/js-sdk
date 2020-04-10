import LCDClient from './util/lcd'
import { IMsg } from './transaction'

export type IConfiguration = {
  volumes?: string[] | null;
  volumesFrom?: string[] | null;
  ports?: string[] | null;
  args?: string[] | null;
  command?: string | null;
  env?: string[] | null;
}

export type IDependency = IConfiguration & {
  key: string;
  image: string;
}

export type IParameter = {
  key: string;
  name?: string | null;
  description?: string | null;
  type: 'String' | 'Number' | 'Boolean' | 'Object' | 'Any';
  optional?: boolean | null;
  repeated?: boolean | null;
  object?: IParameter[] | null;
}

export type ITask = {
  key: string;
  name?: string | null;
  description?: string | null;
  inputs?: IParameter[] | null;
  outputs?: IParameter[] | null;
}

export type IEvent = {
  key: string;
  name?: string | null;
  description?: string | null;
  data?: IParameter[] | null;
}

export type IService = {
  hash?: string;
  sid?: string | null;
  name?: string | null;
  description?: string | null;
  configuration: IConfiguration;
  tasks?: ITask[] | null;
  events?: IEvent[] | null;
  dependencies?: IDependency[];
  repository?: string | null;
  source?: string | null;
  address?: string | null;
}

export type IDefinition = {
  sid?: string | null;
  name?: string | null;
  description?: string | null;
  configuration?: IConfiguration;
  tasks?: ITask[] | null;
  events?: IEvent[] | null;
  dependencies?: IDependency[] | null;
  repository?: string | null;
  source?: string | null;
}

export type IMsgCreate = IDefinition & {
  owner: string;
}

export default class Service extends LCDClient {

  createMsg(owner: string, definition: IDefinition): IMsg<IMsgCreate> {
    const {
      sid, name, description, configuration, tasks, events, dependencies, repository, source
    } = definition
    return {
      type: 'service/create',
      value: {
        owner,
        sid,
        name,
        description,
        configuration,
        tasks,
        events,
        dependencies,
        repository,
        source,
      }
    }
  }

  async get(hash: string): Promise<IService> {
    return (await this.query(`/service/get/${hash}`)).result
  }

  async exists(hash: string): Promise<boolean> {
    return (await this.query(`/service/exist/${hash}`)).result
  }

  async hash(definition: IDefinition): Promise<string> {
    return (await this.query(`/service/hash`, definition, 'POST')).result
  }

  async list(): Promise<IService[]> {
    return (await this.query('/service/list')).result || []
  }
}