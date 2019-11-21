import { hash, IApi } from "../types";

const _resolutionTable: Map<string, hash> = new Map()

// TODO: should we keep those functions??
// returns an instanceHash based on an sid
// throw an error if the sid doesn't exists or have if it has more or less than one instance running
export const resolveSID = async (api: IApi, sid: string): Promise<hash> => {
  if (_resolutionTable.has(sid)) return _resolutionTable.get(sid)

  // TODO: add filter directly on list API
  const { services } = await api.service.list({})
  const matching = services.filter(x => x.sid === sid)
  if (matching.length === 0) throw new Error(`cannot resolve ${sid}`)
  if (matching.length > 1) throw new Error(`multiple services resolve ${sid}`)
  const service = matching[0]

  // find matching instances
  const { instances } = await api.instance.list({ filter: { serviceHash: service.hash }})
  if (!instances || instances.length === 0) throw new Error(`no instances running for the service ${service.sid}`)
  if (instances.length > 1) throw new Error(`multiple instances running for the service ${service.sid}`)

  _resolutionTable.set(sid, instances[0].hash)
  return _resolutionTable.get(sid)
}

const _resolutionTableRunners: Map<string, hash> = new Map()

// returns a Runner Hash based on an sid
// throw an error if the sid doesn't exists or have if there is not exactly one runner running
export const resolveSIDRunner = async (api: IApi, sid: string): Promise<hash> => {
  if (_resolutionTableRunners.has(sid)) return _resolutionTableRunners.get(sid)

  // TODO: add filter directly on list API
  const { services } = await api.service.list({})
  const matching = services.filter(x => x.sid === sid)
  if (matching.length === 0) throw new Error(`cannot resolve ${sid}`)
  if (matching.length > 1) throw new Error(`multiple services resolve ${sid}`)
  const service = matching[0]

  // find matching instances
  const { instances } = await api.instance.list({ filter: { serviceHash: service.hash }})
  if (!instances || instances.length === 0) throw new Error(`no instances for the service ${service.sid}`)
  if (instances.length > 1) throw new Error(`multiple instances for the service ${service.sid}`)
  const instance = instances[0]

  // find matching runners
  const { runners } = await api.runner.list({ filter: { instanceHash: instance.hash }})
  if (!runners || runners.length === 0) throw new Error(`no runners for the service ${service.sid}`)
  if (runners.length > 1) throw new Error(`multiple runners for the service ${service.sid}`)
  const runner = runners[0]

  _resolutionTableRunners.set(sid, runner.hash)
  return _resolutionTableRunners.get(sid)
}
