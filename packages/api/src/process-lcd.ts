import * as ProcessType from './typedef/process'
import LCDClient from './util/lcd'
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

export type IOutputNullType = {
  type: 'mesg.types.Process_Node_Map_Output_Null_';
  value: {
    null?: 0
  }
}

export type IOutputStringType = {
  type: 'mesg.types.Process_Node_Map_Output_StringConst';
  value: {
    string_const: string;
  }
}

export type IOutputDoubleType = {
  type: 'mesg.types.Process_Node_Map_Output_DoubleConst';
  value: {
    double_const: number;
  }
}

export type IOutputBoolType = {
  type: 'mesg.types.Process_Node_Map_Output_BoolConst';
  value: {
    bool_const: boolean;
  }
}

export type IOutputListType = {
  type: 'mesg.types.Process_Node_Map_Output_List_';
  value: {
    list: {
      outputs: IOutput[]
    }
  }
}

export type IOutputMapType = {
  type: 'mesg.types.Process_Node_Map_Output_Map_';
  value: {
    map: IMapOutput[]
  }
}

export type IRefSelectorKey = {
  type: "mesg.types.Process_Node_Map_Output_Reference_Path_Key";
  value: {
    key: string;
  }
}

export type IRefSelectorIndex = {
  type: "mesg.types.Process_Node_Map_Output_Reference_Path_Index";
  value: {
    index?: string;
  }
}

export type IRefPath = {
  path?: IRefPath
  Selector: IRefSelectorKey | IRefSelectorIndex
}

export type IOutputRefType = {
  type: 'mesg.types.Process_Node_Map_Output_Ref';
  value: {
    ref: {
      nodeKey: string;
      path: IRefPath
    }
  }
}

export type IOutput = {
  Value: IOutputNullType | IOutputStringType | IOutputDoubleType | IOutputBoolType | IOutputListType | IOutputMapType | IOutputRefType
}

export type IMapOutput = {
  Key: string,
  Value: IOutput
}

export enum FilterPredicate {
  Unknown = 0,
  EQ = 1
}

export type IFilterCondition = {
  key: string;
  predicate: FilterPredicate;
  value: string;
}

export type IFilter = {
  conditions: IFilterCondition[];
}

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
    map: IMapOutput[];
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

export type IMsgCreate = {
  address: string;
  request: IProcessRequest;
}

export default class Process extends LCDClient {

  createMsg(owner: string, process: IProcessRequest): IMsg<IMsgCreate> {
    return {
      type: 'process/CreateProcess',
      value: {
        address: owner,
        request: process
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