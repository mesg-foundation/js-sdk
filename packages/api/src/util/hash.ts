import * as ServiceType from '../typedef/service'
import * as ExecutionType from '../typedef/execution'
import * as bs58 from './base58'
import { createHash } from 'crypto'

export const base58Encode = (value: Buffer | Uint8Array): string => {
  if (value && value.length > 0) {
    return bs58.encode(value)
  }
  return ''
}

export const hashBase58 = (value: string): string => {
  if (value) {
    return base58Encode(createHash('sha256').update(value).digest())
  }
  return ''
}

const serialize = (index: string, value: string): string => {
  return value ? index + ':' + value + ';' : ''
}

const serializeArray = (array: any[], serializeFunc?: (value: any) => string): string => {
  if (!array) return ''
  return array.reduce((prev, value, i) => {
    return prev + serialize(i.toString(), serializeFunc ? serializeFunc(value) : value)
  }, '')
  // var value = ''
  // for (var i = 0; i < array.length; i++) {
  //   value += serialize(i.toString(), serializeFunc ? serializeFunc(array[i]) : array[i])
  // }
  // console.log('serializeArray\t\t', value)
  // return serialize(value)
}

// const serializeUint8Array = (array: Uint8Array): string => {
//   var value = ''
//   if (!array) return serialize('')
//   for (var i = 0; i < array.length; i++) {
//     value += serialize(i.toString(), array[i].toString())
//   }
//   console.log('serializeUint8Array\t\t', value)
//   return serialize(value)
// }

const serializeMap = (map: { [k: string]: any }, serializeFunc?: (value: any) => string): string => {
  const keys = Object.keys(map).sort() // sorted in ascending, ASCII character order
  return keys.reduce((prev, key) => {
    return prev + serialize(key, serializeFunc ? serializeFunc(map[key]) : map[key])
  }, '')
  // for (var i = 0; i < array.length; i++) {
  //   value += serialize(array[i], serializeFunc ? serializeFunc(map[array[i]]) : map[array[i]])
  // }
  // console.log('serializeMap\t\t\t', value)
  // return serialize(value)
}

export const serializeService = (data: ServiceType.mesg.types.IService): string => {
  if (!data) return ''
  return serialize('1', data.name) +
    serialize('2', data.description) +
    serialize('5', serializeArray(data.tasks, serializeServiceTask)) +
    serialize('6', serializeArray(data.events, serializeServiceEvent)) +
    serialize('7', serializeArray(data.dependencies, serializeServiceDependency)) +
    serialize('8', serializeServiceConfiguration(data.configuration)) +
    serialize('9', data.repository) +
    serialize('12', data.sid) +
    serialize('13', data.source)
}

export const serializeServiceConfiguration = (data: ServiceType.mesg.types.Service.IConfiguration): string => {
  if (!data) return ''
  return serialize('1', serializeArray(data.volumes)) +
    serialize('2', serializeArray(data.volumesFrom)) +
    serialize('3', serializeArray(data.ports)) +
    serialize('4', serializeArray(data.args)) +
    serialize('5', data.command) +
    serialize('6', serializeArray(data.env))
}

export const serializeServiceDependency = (data: ServiceType.mesg.types.Service.IDependency): string => {
  if (!data) return ''
  return serialize('1', data.image) +
    serialize('2', serializeArray(data.volumes)) +
    serialize('3', serializeArray(data.volumesFrom)) +
    serialize('4', serializeArray(data.ports)) +
    serialize('5', data.command) +
    serialize('6', serializeArray(data.args)) +
    serialize('8', data.key) +
    serialize('9', serializeArray(data.env))
}

export const serializeServiceParameter = (data: ServiceType.mesg.types.Service.IParameter): string => {
  if (!data) return ''
  return serialize('1', data.name) +
    serialize('2', data.description) +
    serialize('3', data.type) +
    serialize('4', data.optional ? 'true' : '') +
    serialize('8', data.key) +
    serialize('9', data.repeated ? 'true' : '') +
    serialize('10', serializeArray(data.object, serializeServiceParameter))
}

export const serializeServiceTask = (data: ServiceType.mesg.types.Service.ITask): string => {
  if (!data) return ''
  return serialize('1', data.name) +
    serialize('2', data.description) +
    serialize('6', serializeArray(data.inputs, serializeServiceParameter)) +
    serialize('7', serializeArray(data.outputs, serializeServiceParameter)) +
    serialize('8', data.key)
}

export const serializeServiceEvent = (data: ServiceType.mesg.types.Service.IEvent): string => {
  if (!data) return ''
  return serialize('1', data.name) +
    serialize('2', data.description) +
    serialize('3', serializeArray(data.data, serializeServiceParameter)) +
    serialize('4', data.key)
}

export const serializeExecution = (data: ExecutionType.mesg.types.IExecution): string => {
  if (!data) return ''
  return serialize('2', base58Encode(data.parentHash)) +
    serialize('3', base58Encode(data.eventHash)) +
    serialize('5', base58Encode(data.instanceHash)) +
    serialize('6', data.taskKey) +
    serialize('7', serializeStruct(data.inputs)) +
    serialize('10', serializeArray(data.tags)) +
    serialize('11', base58Encode(data.processHash)) +
    serialize('12', data.nodeKey) +
    serialize('13', base58Encode(data.executorHash))
}

export const serializeStruct = (data: ExecutionType.mesg.protobuf.IStruct): string => {
  if (!data) return ''
  return serialize('1', serializeMap(data.fields, serializeStructValue))
}

export const serializeStructValue = (data: ExecutionType.mesg.protobuf.IValue): string => {
  if (!data) return ''
  return serialize('2', data.numberValue ? data.numberValue.toString() : '') +
    serialize('3', data.stringValue) +
    serialize('4', data.boolValue ? 'true' : '') +
    serialize('5', serializeStruct(data.structValue)) +
    serialize('6', serializeStructList(data.listValue))
    // serialize('1', data.nullValue) +
}

export const serializeStructList = (data: ExecutionType.mesg.protobuf.IListValue): string => {
  if (!data) return ''
  return serialize('1', serializeArray(data.values, serializeStructValue))
}