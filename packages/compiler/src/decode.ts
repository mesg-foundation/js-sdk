import yaml from 'js-yaml'

const replaceVariable = (value: any, env: { [key: string]: string }) => {
  if (typeof value !== 'string') return value
  const reg = new RegExp('\\$\\(env\\:(.*)\\)', 'g')
  return value.replace(reg, (_: string, p1: string) => {
    if (!Object.keys(env).includes(p1)) {
      throw new Error('env variable ' + p1 + ' must be set')
    }
    return env[p1]
  })
}

export default (content: Buffer, env: { [key: string]: string }) => {
  const data = yaml.safeLoad(content.toString())
  return JSON.parse(JSON.stringify(data), function (this: any, _: string, value: any) {
    return replaceVariable(value, env)
  })
}