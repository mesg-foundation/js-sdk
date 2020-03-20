import ServiceType from "@mesg/api/lib/typedef/service";
import ExecutionType from "@mesg/api/lib/typedef/execution";
import { encode } from '@mesg/api/lib/util/encoder';

export const convert = (task: ServiceType.mesg.types.Service.ITask, data: { [key: string]: any }): ExecutionType.mesg.protobuf.IStruct => {
  const convert = (type: 'Object' | 'String' | 'Boolean' | 'Number' | 'Any', value: string | any): any => {
    return {
      Object: (x: string | any) => typeof x === 'string' ? JSON.parse(x) : x,
      String: (x: string) => x,
      Boolean: (x: string) => ['true', 't', 'TRUE', 'T', '1'].includes(x),
      Number: (x: string) => parseFloat(x),
      Any: (x: string) => x,
    }[type](value)
  }
  const result = (task.inputs || [])
    .filter((x: any) => data[x.key] !== undefined && data[x.key] !== null)
    .reduce((prev: any, value: any) => ({
      ...prev,
      [value.key]: convert(value.type, data[value.key])
    }), {})
  return encode(result || {})
}
