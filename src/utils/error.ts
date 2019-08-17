export const isAlreadyExists = (err: Error, resource: string): boolean => {
  const reg = new RegExp(`${resource} \"(.*)\" already exists`)
  return reg.test(err.message)
}

export const resourceHash = (err: Error, resource: string): string => {
  const reg = new RegExp(`${resource} \"(.*)\" already exists`)
  const res = reg.exec(err.message)
  if (!res) return ''
  return res[1]
}
