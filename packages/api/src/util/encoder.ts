export const encodeField = (value: any) => {
  switch (Object.prototype.toString.call(value)) {
    case '[object Null]':
    case '[object Undefined]':
      return { nullValue: value }
    case '[object Object]':
      return { structValue: {
        fields: encodeFields(value)
      }}
    case '[object Array]':
      return { listValue: {
        values: value.map((_: any, i: number) => encodeField(value[i]))
      }}
    case '[object Number]':
      return { numberValue: value }
    case '[object Boolean]':
      return { boolValue: value }
    case '[object String]':
      return { stringValue: value }
    case '[object Date]':
      return { stringValue: (value as Date).toJSON() }
    case '[object BigNumber]':
      return { stringValue: value.toJSON() }
    default:
      throw new Error('not supported')
  }
}

const encodeFields = (data: any): { [k: string]: any } => Object.keys(data || {}).reduce((prev, next) => ({
  ...prev,
  [next]: encodeField(data[next])
}), {})

export const encode = (data: { [key: string]: any }): any => {
  return {
    fields: encodeFields(data)
  }
}

export const decodeField = (field: any) => {
  const kind = ['list', 'struct', 'string', 'number', 'bool']
    .find((x) => (field as any)[`${x}Value`] !== undefined) || 'null'
  const value = (field as any)[`${kind}Value`]
  switch (kind) {
    case 'string':
    case 'number':
    case 'bool':
    case 'null':
      return value
    case 'struct':
      return decode(value)
    case 'list':
      return (value.values || []).map((_: any, i: number) => decodeField(value.values[i]))
    default:
      throw new Error('not implemented')
  }
}

export const decode = (data: any): { [key: string]: any } => {
  return Object.keys(data.fields || {}).reduce((prev, next) => ({
    ...prev,
    [next]: decodeField(data.fields[next])
  }), {})
}