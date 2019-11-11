import {hash, IApi} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'
import {resolveSID} from '@mesg/api/lib/util/resolve'

export default async (api: IApi, sidOrHash: hash | string): Promise<hash> => {
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
