import {IProcess, IMapType, IFilterType, INode, IResultType, IEventType, ITaskType, FilterPredicate, IOutput, IRefPath} from '@mesg/api/lib/process-lcd'
import decode from './decode'
import {Process} from './schema/process'
import validate from './validate'
const schema = require('./schema/process.json')

const compileInstance = async (def: any, opts: any): Promise<string> => opts.instanceResolver
  ? await opts.instanceResolver(def)
  : def.instanceHash

const compileResult = async (def: any, opts: any): Promise<IResultType> => ({
  type: "mesg.types.Process_Node_Result_",
  value: {
    result: {
      instanceHash: await compileInstance(def, opts),
      taskKey: def.taskKey
    }
  }
})

const compileEvent = async (def: any, opts: any): Promise<IEventType> => ({
  type: "mesg.types.Process_Node_Event_",
  value: {
    event: {
      instanceHash: await compileInstance(def, opts),
      eventKey: def.eventKey
    }
  }
})

const compileTask = async (def: any, opts: any): Promise<ITaskType> => ({
  type: "mesg.types.Process_Node_Task_",
  value: {
    task: {
      instanceHash: await compileInstance(def, opts),
      taskKey: def.taskKey
    }
  }
})

const extractPathsFromKey = (key: string): string[] => {
  return key.replace(/\[(\d)\]/g, val => `.${val}`).split('.')
}

const extractPathFromPaths = (paths: string[]): IRefPath => {
  if (paths.length === 0) return null
  const [currentPath, ...nextPaths] = paths
  const indexRegex = /^\[(\d)\]$/
  if (indexRegex.test(currentPath)) {
    const index = indexRegex.exec(currentPath)[1]
    const value = index && index !== '0'
      ? { index }
      : {}
    return {
      path: extractPathFromPaths(nextPaths),
      Selector: {
        type: "mesg.types.Process_Node_Map_Output_Reference_Path_Index",
        value
      }
    }
  }
  return {
    path: extractPathFromPaths(nextPaths),
    Selector: {
      type: 'mesg.types.Process_Node_Map_Output_Reference_Path_Key',
      value: {
        key: currentPath
      }
    }
  }
}

const compileMapOutput = (def: any, opts: any): IOutput => {
  if (def === null) return { Value: { type: "mesg.types.Process_Node_Map_Output_Null_", value: { } } }
  if (typeof def === 'number') return { Value: { type: "mesg.types.Process_Node_Map_Output_DoubleConst", value: { double_const: def } } }
  if (typeof def === 'boolean') return { Value: { type: 'mesg.types.Process_Node_Map_Output_BoolConst', value: { bool_const: def } } }
  if (typeof def === 'string') return { Value: { type: 'mesg.types.Process_Node_Map_Output_StringConst', value: { string_const: def } } }
  if (typeof def === 'object' && !!def.key) return {
    Value: {
      type: 'mesg.types.Process_Node_Map_Output_Ref',
      value: {
        ref: {
          path: extractPathFromPaths(extractPathsFromKey(def.key)),
          nodeKey: def.stepKey || opts.defaultNodeKey
        }
      }
    }
  }
  if (Array.isArray(def)) return {
    Value: {
      type: 'mesg.types.Process_Node_Map_Output_List_',
      value: {
        list: {
          outputs: def.map(item => compileMapOutput(item, opts))
        }
      }
    }
  }
  return {
    Value: {
      type: 'mesg.types.Process_Node_Map_Output_Map_',
      value: {
        map: Object.keys(def).map((key) => ({
          Key: key,
          Value: compileMapOutput(def[key], opts)
        })).sort((a, b) => a.Key.localeCompare(b.Key))
      }
    }
  }
}

const compileMap = async (def: any, opts: any): Promise<IMapType> => {
  if (typeof def !== 'object' || Array.isArray(def)) throw new Error('Map output should be a map')
  const outputs = compileMapOutput(def, opts)
  if (outputs.Value.type !== 'mesg.types.Process_Node_Map_Output_Map_') throw new Error('Map output should be a map')
  return {
    type: 'mesg.types.Process_Node_Map_',
    value: {
      map: outputs.Value.value.map
        .sort((a, b) => a.Key.localeCompare(b.Key))
    }
  }
}

const compileFilter = async (def: any): Promise<IFilterType> => ({
  type: 'mesg.types.Process_Node_Filter_',
  value: {
    filter: {
      conditions: Object.keys(def.conditions).map(key => ({
        key,
        predicate: FilterPredicate.EQ,
        value: def.conditions[key]
      })).sort((a, b) => a.key.localeCompare(b.key))
    }
  }
})

const nodeCompiler = async (
  type: 'result' | 'event' | 'task' | 'map' | 'filter',
  def: any,
  key: string,
  opts: {
    defaultNodeKey?: string | null,
    instanceResolver?(object: any): Promise<string>
  }
): Promise<INode> => {
  const nodes = {
    result: compileResult,
    event: compileEvent,
    task: compileTask,
    map: compileMap,
    filter: compileFilter
  }

  return {
    key,
    Type: await nodes[type](def, opts)
  }
}

export default async (content: Buffer, instanceResolver: (object: any) => Promise<string>, envs: { [key: string]: string }): Promise<IProcess> => {
  const definition = decode(content, envs) as Process
  validate(schema, definition)

  let nodes = []
  let edges = []

  let previousKey: string | null = null
  let i = 0
  for (const step of definition.steps) {
    step.key = step.key || `node-${i}`
    if (step.type === 'task' && step.inputs) {
      const mapKey = `${step.key}-inputs`
      const mapNode = await nodeCompiler('map', step.inputs, mapKey, {defaultNodeKey: previousKey})
      nodes.push(mapNode)
      if (previousKey) {
        edges.push({src: previousKey, dst: mapKey})
      }
      previousKey = mapKey
      i++
    }
    const type = step.type !== 'trigger'
      ? step.type
      : step.eventKey
        ? 'event'
        : 'result'
    const stepNode = await nodeCompiler(type, step, step.key, {instanceResolver})
    nodes.push(stepNode)
    if (previousKey) {
      edges.push({src: previousKey, dst: step.key})
    }
    previousKey = step.key
    i++
  }

  return {
    name: definition.name || definition.key,
    nodes,
    edges,
  }
}
