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
  type: "mesg.types.Process_Node_Reference_Path_Key";
  value: {
    key: string;
  }
}

export type IRefSelectorIndex = {
  type: "mesg.types.Process_Node_Reference_Path_Index";
  value: {
    index?: string;
  }
}

export type IRefPath = {
  path?: IRefPath
  Selector: IRefSelectorKey | IRefSelectorIndex
}

export type IReference = {
  type: 'mesg.types.Process_Node_Reference';
  value: {
    ref: {
      nodeKey: string;
      path: IRefPath
    }
  }
}

export type IOutput = {
  Value: IOutputNullType | IOutputStringType | IOutputDoubleType | IOutputBoolType | IOutputListType | IOutputMapType | IReference
}

export type IMapOutput = {
  Key: string,
  Value: IOutput
}

export enum FilterPredicate {
  Unknown = 0,
  EQ = 1,
  GT = 2,
  GTE = 3,
  LT = 4,
  LTE = 5,
  CONTAINS = 6
}

export const Predicate = {
  EQ: FilterPredicate.EQ,
  GT: FilterPredicate.GT,
  GTE: FilterPredicate.GTE,
  LT: FilterPredicate.LT,
  LTE: FilterPredicate.LTE,
  CONTAINS: FilterPredicate.CONTAINS
}

export type IFilterValueNullType = {
  type: 'mesg.types.Value_NullValue';
  value: {
    null?: 0
  }
}

export type IFilterValueStringType = {
  type: 'mesg.types.Value_StringValue';
  value: {
    string_value: string;
  }
}

export type IFilterValueNumberType = {
  type: 'mesg.types.Value_NumberValue';
  value: {
    number_value: number;
  }
}

export type IFilterValueBoolType = {
  type: 'mesg.types.Value_BoolValue';
  value: {
    bool_value: boolean;
  }
}


export type IFilterCondition = {
  ref: {
    nodeKey: string;
    path: IRefPath;
  };
  predicate: FilterPredicate;
  value: {
    Kind: IFilterValueNullType | IFilterValueStringType | IFilterValueNumberType | IFilterValueBoolType
  };
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
  address?: string;
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

export type IMsgDelete = {
  address: string;
  request: {
    hash: string;
  }
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

  deleteMsg(owner: string, hash: string): IMsg<IMsgDelete> {
    return {
      type: 'process/DeleteProcess',
      value: {
        address: owner,
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