import * as ProcessType from '@mesg/api/lib/typedef/process'
import {IProcess} from '@mesg/api/lib/process'
import {hash} from '@mesg/api/lib/types'
import decode from './decode'
import {Process} from './schema/process'
import validate from './validate'
const schema = require('./schema/process.json')

const compileInstance = async (def: any, opts: any): Promise<Uint8Array> => opts.instanceResolver
  ? await opts.instanceResolver(def)
  : def.instanceHash

const compileResult = async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IResult> => ({
  instanceHash: await compileInstance(def, opts),
  taskKey: def.taskKey
})

const compileEvent = async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IEvent> => ({
  instanceHash: await compileInstance(def, opts),
  eventKey: def.eventKey
})

const compileTask = async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.ITask> => ({
  instanceHash: await compileInstance(def, opts),
  taskKey: def.taskKey
})

const extractPathsFromKey = (key: string): string[] => {
  return key.replace(/\[(\d)\]/g, val => `.${val}`).split('.')
}

const extractPathFromPaths = (paths: string[]): ProcessType.mesg.types.Process.Node.Map.Output.Reference.Path => {
  if (paths.length === 0) return null
  const [currentPath, ...nextPaths] = paths
  const indexRegex = /^\[(\d)\]$/
  if (indexRegex.test(currentPath)) {
    return {
      selector: "index",
      key: null,
      index: parseInt(indexRegex.exec(currentPath)[1], 10),
      path: extractPathFromPaths(nextPaths)
    }
  }
  return {
    selector: "key",
    index: null,
    key: currentPath,
    path: extractPathFromPaths(nextPaths),
  }
}

const compileMapOutput = (def: any, opts: any): ProcessType.mesg.types.Process.Node.Map.IOutput => {
  if (def === null) return { null: 0 /* ProcessType.mesg.types.Process.Node.Map.Output.Null.NULL_VALUE */ }
  if (typeof def === 'number') return { doubleConst: def }
  if (typeof def === 'boolean') return { boolConst: def }
  if (typeof def === 'string') return { stringConst: def }
  if (typeof def === 'object' && !!def.key) return {
    ref: {
      path: extractPathFromPaths(extractPathsFromKey(def.key)),
      nodeKey: def.stepKey || opts.defaultNodeKey
    }
  }
  if (Array.isArray(def)) return {
    list: {
      outputs: def.map(item => compileMapOutput(item, opts))
    }
  }
  return {
    map: {
      outputs: Object.keys(def).reduce((prev, key) => ({
        ...prev,
        [key]: compileMapOutput(def[key], opts)
      }), {})
    }
  }
}

const compileMap = async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IMap> => {
  if (typeof def !== 'object' || Array.isArray(def)) throw new Error('Map output should be a map')
  return compileMapOutput(def, opts).map
}

const compileFilter = async (def: any): Promise<ProcessType.mesg.types.Process.Node.IFilter> => ({
  conditions: Object.keys(def.conditions).map(key => ({
    key,
    predicate: 1, // EQ
    value: def.conditions[key]
  }))
})

const nodeCompiler = async (
  type: 'result' | 'event' | 'task' | 'map' | 'filter',
  def: any,
  key: string,
  opts: {
    defaultNodeKey?: string | null,
    instanceResolver?(object: any): Promise<hash>
  }
): Promise<ProcessType.mesg.types.Process.Node> => {
  const nodes = {
    result: compileResult,
    event: compileEvent,
    task: compileTask,
    map: compileMap,
    filter: compileFilter
  }
  return {
    key,
    [type]: await nodes[type](def, opts)
  }
}

export default async (content: Buffer, instanceResolver: (object: any) => Promise<hash>, envs: { [key: string]: string }): Promise<IProcess> => {
  const definition = decode(content, envs) as Process
  validate(schema, definition)
  
  let nodes = []
  let edges = []

  let previousKey: string | null = null
  let previousKeyWithOutputs: string | null = null
  let i = 0
  for (const step of definition.steps) {
    step.key = step.key || `node-${i}`
    if (step.type === 'task' && step.inputs) {
      const mapKey = `${step.key}-inputs`
      const mapNode = await nodeCompiler('map', step.inputs, mapKey, {defaultNodeKey: previousKeyWithOutputs})
      nodes.push(mapNode)
      if (previousKey) {
        edges.push({src: previousKey, dst: mapKey})
      }
      previousKeyWithOutputs = previousKey = mapKey
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
    if (type !== 'filter') {
      previousKeyWithOutputs = step.key
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
