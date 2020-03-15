import pick from 'lodash.pick'
import {IService} from '@mesg/api/lib/service-lcd'
import decode from './decode'

const mapToArray = (inputs: any) => Object.keys(inputs || {}).map(key => ({
  ...inputs[key],
  key
}))

const parseParams = (params: any): any => mapToArray(params).map(x => ({
  ...pick(x, ['key', 'name', 'description', 'type', 'repeated', 'optional']),
  object: parseParams(x.object),
}))

export default async (content: Buffer): Promise<IService> => {
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