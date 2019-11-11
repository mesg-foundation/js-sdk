import {hash, IApi} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'

export default async (api: IApi, sidOrHash: hash | string): Promise<hash> => {
  try {
    let hash: hash
    if (sidOrHash instanceof Uint8Array) {
      hash = sidOrHash
    } else {
      hash = base58.decode(sidOrHash)
    }
    await api.service.get({hash})
    return hash
  } catch {
    const {services} = await api.service.list({})
    const match = (services || []).filter(x => x.sid === sidOrHash)
    if (match.length === 0) throw new Error(`no service matching ${sidOrHash}`)
    if (match.length > 1) throw new Error(`multiple services matching ${sidOrHash}`)
    return match[0].hash as hash
  }
}
