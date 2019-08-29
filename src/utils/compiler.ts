import yaml from 'js-yaml'
import pick from 'lodash.pick'
import * as WorkflowType from 'mesg-js/lib/api/typedef/workflow'
import {Service, Workflow, hash} from 'mesg-js/lib/api/types'

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
    ...pick(definition, ['sid', 'name', 'description', 'configuration', 'repository']),
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

export const workflow = async (content: Buffer, instanceResolver: (object: any) => Promise<hash>): Promise<Workflow> => {
  const definition = decode(content)
  const createNode = async (def: any, index: number): Promise<WorkflowType.types.Workflow.INode> => ({
    key: def.key || `node-${index}`,
    taskKey: def.taskKey,
    instanceHash: await instanceResolver(def)
  })
  const orderedNodes = await Promise.all(definition.tasks.map(createNode)) as WorkflowType.types.Workflow.INode[]

  const trigger = {
    instanceHash: await instanceResolver(definition.trigger),
    taskKey: definition.trigger.taskKey,
    eventKey: definition.trigger.eventKey,
    nodeKey: orderedNodes[0].key
  }

  const edges: any[] = []
  for (let i = 0; i < orderedNodes.length - 1; i++) {
    edges.push({
      src: orderedNodes[i].key,
      dst: orderedNodes[i + 1].key
    })
  }

  return {
    key: definition.key,
    trigger,
    nodes: orderedNodes,
    edges,
  }
}
