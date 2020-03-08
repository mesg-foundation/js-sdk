import * as ServiceType from './typedef/service'
import LCDClient from './util/lcd'

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
}

export default class ServiceLCD extends LCDClient {

  async get(hash: string): Promise<IService> {
    return (await this.query(`/service/get/${hash}`)).result
  }

  async exists(hash: string): Promise<boolean> {
    return (await this.query(`/service/exist/${hash}`)).result
  }

  async hash(request: IService): Promise<string> {
    return (await this.query(`/service/hash`, request, 'POST')).result
  }

  async list(): Promise<IService[]> {
    return (await this.query('/service/list')).result || []
  }
}