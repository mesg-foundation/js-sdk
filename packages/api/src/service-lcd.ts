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

  // async get(hash: hash): Promise<IServiceLCD> {
  // }

  // async exists(hash: hash): Promise<boolean> {
  // }

  // async hash(request: ServiceHashInputs): Promise<hash> {
  // }

  async list(): Promise<IService[]> {
    return (await this.query('/service/list')).result || []
  }
}