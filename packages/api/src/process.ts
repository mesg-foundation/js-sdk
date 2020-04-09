import * as ProcessType from './typedef/process'
import LCDClient from './util/lcd'
import { IMsg } from './transaction'
import { IValueNullType, IValueStringType, IValueNumberType, IValueBoolType } from './struct'

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

export type IFilterValueNullType = IValueNullType
export type IFilterValueStringType = IValueStringType
export type IFilterValueNumberType = IValueNumberType
export type IFilterValueBoolType = IValueBoolType

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

export type IDefinition = {
  name: string;
  nodes: INode[];
  edges: ProcessType.mesg.types.Process.IEdge[];
}

export type IProcess = IDefinition & {
  hash: string;
  address: string;
}

export type IMsgCreate = {
  owner: string;
  name: string;
  nodes: INode[];
  edges: ProcessType.mesg.types.Process.IEdge[];
}

export type IMsgDelete = {
  owner: string;
  hash: string;
}

export default class Process extends LCDClient {

  createMsg(owner: string, definition: IDefinition): IMsg<IMsgCreate> {
    return {
      type: 'process/create',
      value: {
        owner,
        edges: definition.edges,
        name: definition.name,
        nodes: definition.nodes
      }
    }
  }

  deleteMsg(owner: string, hash: string): IMsg<IMsgDelete> {
    return {
      type: 'process/delete',
      value: {
        owner,
        hash
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