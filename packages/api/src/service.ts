import * as ServiceType from './typedef/service'
import LCDClient from './util/lcd'
import { IMsg } from './transaction'

export type IService = {
  hash?: string;
  sid?: string | null;
  name?: string | null;
  description?: string | null;
  configuration: ServiceType.mesg.types.Service.IConfiguration;
  tasks?: ServiceType.mesg.types.Service.ITask[] | null;
  events?: ServiceType.mesg.types.Service.IEvent[] | null;
  dependencies?: ServiceType.mesg.types.Service.IDependency[] | null;
  repository?: string | null;
  source?: string | null;
  address?: string | null;
}

export type IDefinition = {
  sid?: string | null;
  name?: string | null;
  description?: string | null;
  configuration?: ServiceType.mesg.types.Service.IConfiguration;
  tasks?: ServiceType.mesg.types.Service.ITask[] | null;
  events?: ServiceType.mesg.types.Service.IEvent[] | null;
  dependencies?: ServiceType.mesg.types.Service.IDependency[] | null;
  repository?: string | null;
  source?: string | null;
}

export type IMsgCreate = IDefinition & {
  owner: string;
}

export default class ServiceLCD extends LCDClient {

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