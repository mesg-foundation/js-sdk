const sortObject = (obj: any): any => {
  if (obj === null) return null
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map((x) => sortObject(x))
  const sortedKeys = Object.keys(obj).sort()
  const result: any = {}
  sortedKeys.forEach(key => {
    result[key] = sortObject(obj[key])
  })
  return result
}

export default sortObject