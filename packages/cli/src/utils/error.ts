import {hash} from '@mesg/api/lib/types'
import * as base58 from '@mesg/api/lib/util/base58'

// TODO: all the following should be replaced by grpc error code
export class IsAlreadyExistsError extends Error {
  static ID = 'ALREADY_EXISTS'
  static regexp = new RegExp('\"(.*)\" already exists')
  static match(err: Error) {
    return IsAlreadyExistsError.regexp.test(err.message)
  }

  hash: hash

  constructor(error: Error) {
    super(error.message)
    const res = IsAlreadyExistsError.regexp.exec(error.message)
    const hash = res && res.length >= 1 ? res[1] : ''
    this.hash = base58.decode(hash)
    this.name = IsAlreadyExistsError.ID
  }
}
