export class IsAlreadyExistsError extends Error {
  static ID = 'ALREADY_EXISTS'
  static regexp = new RegExp('\"(.*)\" already exists')
  static match(err: Error) {
    return IsAlreadyExistsError.regexp.test(err.message)
  }

  hash: string

  constructor(error: Error) {
    super(error.message)
    const res = IsAlreadyExistsError.regexp.exec(error.message)
    this.hash = res && res.length >= 1 ? res[1] : ''
    this.name = IsAlreadyExistsError.ID
  }
}
