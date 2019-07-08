import {API, hash} from 'mesg-js/lib/api/types'
import {resolveSID} from 'mesg-js/lib/util/resolve'

export default async (api: API, sidOrHash: hash | string): Promise<hash> => {
  try {
    await api.instance.get({hash: sidOrHash})
    return sidOrHash
  } catch {
    return resolveSID(api, sidOrHash)
  }
}
