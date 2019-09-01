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
        ref: pick(def.inputs[key], ['key', 'nodeKey'])
      }))
    }),
    filter: async (def: any, key: string): Promise<ProcessType.types.Process.Node.IFilter> => ({
      key,
      conditions: Object.keys(def).map(key => ({
        key,
        predicate: 1, // EQ
        value: def[key]
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

  let trigger = await (definition.trigger.eventKey
    ? compileNode('event', definition.trigger, definition.trigger.key)
    : compileNode('result', definition.trigger, definition.trigger.key))

  nodes.push(trigger)

  let previousKey = definition.trigger.key
  for (const task of definition.tasks) {
    if (task.filter) {
      const filterKey = `${previousKey}-filter`
      const filterNode = await compileNode('filter', task.filter, filterKey)
      nodes.push(filterNode)
      edges.push({src: previousKey, dst: filterKey})
      previousKey = filterKey
    }
    if (task.inputs) {
      const mapKey = `${previousKey}-map`
      const mapNode = await compileNode('map', task, mapKey)
      nodes.push(mapNode)
      edges.push({src: previousKey, dst: mapKey})
      previousKey = mapKey
    }
    const taskNode = await compileNode('task', task, task.key)
    nodes.push(taskNode)
    edges.push({src: previousKey, dst: task.key})
    previousKey = task.key
  }

  return {
    key: definition.key,
    nodes,
    edges,
  }
}
