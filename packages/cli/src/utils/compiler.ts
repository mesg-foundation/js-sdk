import yaml from 'js-yaml'
import pick from 'lodash.pick'
import * as ProcessType from '@mesg/api/lib/typedef/process'
import {hash} from '@mesg/api/lib/types'
import {IService} from '@mesg/api/lib/service'
import {IProcess} from '@mesg/api/lib/process'
import {encodeField} from '@mesg/api/lib/util/encoder'

const replaceVariable = (value: any, env: { [key: string]: string }) => {
  if (typeof value !== 'string') return value
  const reg = new RegExp('\\$\\(env\\:(.*)\\)', 'g')
  return value.replace(reg, (_: string, p1: string) => {
    if (!Object.keys(env).includes(p1)) {
      throw new Error('env variable ' + p1 + ' must be set')
    }
    return env[p1]
  })
}

const decode = (content: Buffer, env: { [key: string]: string }) => {
  const data = yaml.safeLoad(content.toString())
  return JSON.parse(JSON.stringify(data), function (this: any, _: string, value: any) {
    return replaceVariable(value, env)
  })
}

const mapToArray = (inputs: any) => Object.keys(inputs || {}).map(key => ({
  ...inputs[key],
  key
}))

const parseParams = (params: any): any => mapToArray(params).map(x => ({
  ...pick(x, ['key', 'name', 'description', 'type', 'repeated', 'optional']),
  object: parseParams(x.object),
}))

export const service = async (content: Buffer): Promise<IService> => {
  const definition = decode(content, {})
  return {
    ...pick(definition, ['sid', 'name', 'description', 'repository']),
    configuration: definition.configuration || {},
    dependencies: mapToArray(definition.dependencies),
    tasks: mapToArray(definition.tasks).map(x => ({
      ...pick(x, ['key', 'name', 'description']),
      inputs: parseParams(x.inputs),
      outputs: parseParams(x.outputs),
    })),
    events: mapToArray(definition.events).map(x => ({
      ...pick(x, ['key', 'name', 'description']),
      data: parseParams(x.data)
    }))
  }
}

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
    result: async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IResult> => ({
      taskKey: def.taskKey,
      instanceHash: opts.instanceResolver ? await opts.instanceResolver(def) : def.instanceHash
    }),
    event: async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IEvent> => ({
      eventKey: def.eventKey,
      instanceHash: opts.instanceResolver ? await opts.instanceResolver(def) : def.instanceHash
    }),
    task: async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.ITask> => ({
      taskKey: def.taskKey,
      instanceHash: opts.instanceResolver ? await opts.instanceResolver(def) : def.instanceHash
    }),
    map: async (def: any, opts: any): Promise<ProcessType.mesg.types.Process.Node.IMap> => ({
      outputs: Object.keys(def).map(key => ({
        key,
        ...(typeof def[key] === 'object' && def[key].key  // if the value is an object containing an attribute key
          ? {
            ref: {
              key: def[key].key,
              nodeKey: def[key].stepKey || opts.defaultNodeKey,
            }
          }
          : {
            constant: encodeField(def[key])
          })
      }))
    }),
    filter: async (def: any): Promise<ProcessType.mesg.types.Process.Node.IFilter> => ({
      conditions: Object.keys(def.conditions).map(key => ({
        key,
        predicate: 1, // EQ
        value: def.conditions[key]
      }))
    })
  }
  return {
    key,
    [type]: await nodes[type](def, opts)
  }
}

export const process = async (content: Buffer, instanceResolver: (object: any) => Promise<hash>, envs: { [key: string]: string }): Promise<IProcess> => {
  const definition = decode(content, envs)

  let nodes = []
  let edges = []

  let previousKey: string | null = null
  let previousKeyWithOutputs: string | null = null
  let i = 0
  for (const step of definition.steps) {
    step.key = step.key || `node-${i}`
    if (step.inputs) {
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
