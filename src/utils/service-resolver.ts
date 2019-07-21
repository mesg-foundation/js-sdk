import {API, hash} from 'mesg-js/lib/api/types'

export default async (api: API, sidOrHash: hash | string): Promise<hash> => {
  try {
    await api.service.get({hash: sidOrHash})
    return sidOrHash
  } catch {
    const {services} = await api.service.list({})
    const match = (services || []).filter(x => x.sid === sidOrHash)
    if (match.length === 0) throw new Error(`no service matching ${sidOrHash}`)
    if (match.length > 1) throw new Error(`multiple services matching ${sidOrHash}`)
    return match[0].hash as hash
  }
}
