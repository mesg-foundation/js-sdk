import * as ProcessType from './typedef/process'
import LCDClient from './util/lcdClient'
import { IMsg } from './transaction'

export type IResult = {
  instanceHash: string;
  taskKey: string;
}

export type IEvent = {
  instanceHash: string;
  eventKey: string;
}

export type ITask = {
  instanceHash: string;
  taskKey: string;
}

export type INode = {
  key: string;
  result?: IResult | null;
  event?: IEvent | null;
  task?: ITask | null;
  map?: ProcessType.mesg.types.Process.Node.IMap | null;
  filter?: ProcessType.mesg.types.Process.Node.IFilter | null;
}

export type IProcess = {
  name: string;
  nodes: INode[];
  edges: ProcessType.mesg.types.Process.IEdge[];
}

export type IProcessRequest = {
  name: string;
  nodes: INode[];
  edges: ProcessType.mesg.types.Process.IEdge[];
}

export type IMsgCreate = {
  owner: string;
  request: IProcessRequest;
}

export type IMsgDelete = {
  owner: string;
  request: {
    hash: string;
  }
}

export default class Process extends LCDClient {

  createMsg(owner: string, process: IProcessRequest): IMsg<IMsgCreate> {
    return {
      type: 'process/CreateProcess',
      value: {
        owner,
        request: process
      }
    }
  }

  deleteMsg(owner: string, hash: string): IMsg<IMsgDelete> {
    return {
      type: 'process/DeleteProcess',
      value: {
        owner,
        request: {
          hash
        }
      }
    }
  }

  async get(hash: string): Promise<IProcess> {
    return (await this.query(`/process/get/${hash}`)).result
  }

  async list(): Promise<IProcess[]> {
    return (await this.query('/process/list')).result || []
  }
}