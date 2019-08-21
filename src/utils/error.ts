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
    const hash = res && res.length >= 1 ? res[1] : ''
    this.hash = hash
    this.name = IsAlreadyExistsError.ID
  }
}

export const errorConversion = (err: Error): Error => {
  if (IsAlreadyExistsError.match(err)) {
    return new IsAlreadyExistsError(err)
  }
  return err
}
