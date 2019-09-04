import yaml from 'js-yaml'
import pick from 'lodash.pick'
import * as ProcessType from 'mesg-js/lib/api/typedef/process'
import {hash, Process, Service} from 'mesg-js/lib/api/types'

const decode = (content: Buffer) => yaml.safeLoad(content.toString())

const mapToArray = (inputs: any) => Object.keys(inputs || {}).map(key => ({
  ...inputs[key],
  key
}))

const parseParams = (params: any): any => mapToArray(params).map(x => ({
  ...pick(x, ['key', 'name', 'description', 'type', 'repeated', 'optional']),
  object: parseParams(x.object),
}))

export const service = async (content: Buffer): Promise<Service> => {
  const definition = decode(content)
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

const nodeCompiler = (instanceResolver: (object: any) => Promise<hash>) => {
  const nodes = {
    result: async (def: any, key: string): Promise<ProcessType.types.Process.Node.IResult> => ({
      key,
      taskKey: def.taskKey,
      instanceHash: await instanceResolver(def)
    }),
    event: async (def: any, key: string): Promise<ProcessType.types.Process.Node.IEvent> => ({
      key,
      eventKey: def.eventKey,
      instanceHash: await instanceResolver(def)
    }),
    task: async (def: any, key: string): Promise<ProcessType.types.Process.Node.ITask> => ({
      key,
      taskKey:
      def.taskKey,
      instanceHash: await instanceResolver(def)
    }),
    map: async (def: any, key: string): Promise<ProcessType.types.Process.Node.IMap> => ({
      key,
      outputs: Object.keys(def.inputs).map(key => ({
        key,
        ref: {
          key: def.inputs[key].key,
          nodeKey: def.inputs[key].stepKey,
        }
      }))
    }),
    filter: async (def: any, key: string): Promise<ProcessType.types.Process.Node.IFilter> => ({
      key,
      conditions: Object.keys(def.conditions).map(key => ({
        key,
        predicate: 1, // EQ
        value: def.conditions[key]
      }))
    })
  }
  return async (type: 'result' | 'event' | 'task' | 'map' | 'filter', def: any, key: string) => ({
    [type]: await nodes[type](def, key)
  })
}

export const process = async (content: Buffer, instanceResolver: (object: any) => Promise<hash>): Promise<Process> => {
  const definition = decode(content)
  const compileNode = nodeCompiler(instanceResolver)

  let nodes = []
  let edges = []

  let previousKey = null
  let i = 0
  for (const step of definition.steps) {
    step.key = step.key || `node-${i}`
    if (step.inputs) {
      const mapKey = `${step.key}-inputs`
      const mapNode = await compileNode('map', step, mapKey)
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
    const stepNode = await compileNode(type, step, step.key)
    nodes.push(stepNode)
    if (previousKey) {
      edges.push({src: previousKey, dst: step.key})
    }
    previousKey = step.key
    i++
  }

  return {
    key: definition.key,
    nodes,
    edges,
  }
}
