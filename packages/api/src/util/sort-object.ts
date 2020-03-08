const sortObject = (obj: any): any => {
  if (obj === null) return null
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj) && obj.length === 0) return null
  if (Array.isArray(obj)) return obj.map((x) => sortObject(x))
  const sortedKeys = Object.keys(obj).sort().filter(x => obj[x] !== undefined && obj[x] !== null)
  return sortedKeys.reduce((prev, key) => ({
    ...prev,
    [key]: sortObject(obj[key])
  }), {})
}

export default sortObject