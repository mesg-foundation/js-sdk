import * as ProcessType from './typedef/process'
import LCDClient from './util/lcd'

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

export default class Process extends LCDClient {
  async get(hash: string): Promise<IProcess> {
    return (await this.query(`/process/get/${hash}`)).result
  }

  async list(): Promise<IProcess[]> {
    return (await this.query('/process/list')).result || []
  }
}