import { mesg } from './typedef/service'
import LCDClient from './util/lcdClient'
import { IMsg } from './transaction'

export interface IService {
  hash?: string;
  sid?: string | null;
  name?: string | null;
  description?: string | null;
  configuration?: mesg.types.Service.IConfiguration | null;
  tasks?: mesg.types.Service.ITask[] | null;
  events?: mesg.types.Service.IEvent[] | null;
  dependencies?: mesg.types.Service.IDependency[] | null;
  repository?: string | null;
  source?: string | null;
}

export default class Service extends LCDClient {

  createMsg(owner: string, service: IService): IMsg {
    return {
      type: 'service/CreateService',
      value: {
        owner,
        request: service
      }
    }
  }

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