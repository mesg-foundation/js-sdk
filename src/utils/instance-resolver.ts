import {API, hash} from 'mesg-js/lib/api/types'
import * as base58 from 'mesg-js/lib/util/base58'
import {resolveSID} from 'mesg-js/lib/util/resolve'

export default async (api: API, sidOrHash: hash | string): Promise<hash> => {
  try {
    let hash: hash
    if (sidOrHash instanceof Uint8Array) {
      hash = sidOrHash
    } else {
      hash = base58.decode(sidOrHash)
    }
    await api.instance.get({hash})
    return hash
  } catch (err) {
    if (typeof sidOrHash === 'string') {
      return resolveSID(api, sidOrHash)
    }
    throw err
  }
}
