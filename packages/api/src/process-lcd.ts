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

export type IMap = any
export type IFilter = any

export type IResultType = {
  type: 'mesg.types.Process_Node_Result_';
  value: {
    result: IResult;
  }
}

export type IEventType = {
  type: 'mesg.types.Process_Node_Event_';
  value: {
    event: IEvent;
  }
}

export type ITaskType = {
  type: 'mesg.types.Process_Node_Task_';
  value: {
    task: ITask;
  }
}

export type IMapType = {
  type: 'mesg.types.Process_Node_Map_';
  value: {
    map: IMap;
  }
}

export type IFilterType = {
  type: 'mesg.types.Process_Node_Filter_';
  value: {
    filter: IFilter;
  }
}

export type INode = {
  key: string;
  Type: IEventType | IResultType | ITaskType | IMapType | IFilterType;
}

export type IProcess = {
  hash?: string;
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