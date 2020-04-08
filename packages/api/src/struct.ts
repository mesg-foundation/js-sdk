export type IValueNullType = {
  type: 'mesg.types.Value_NullValue';
  value: {
    null?: 0
  }
}

export type IValueStringType = {
  type: 'mesg.types.Value_StringValue';
  value: {
    string_value: string;
  }
}

export type IValueNumberType = {
  type: 'mesg.types.Value_NumberValue';
  value: {
    number_value: number;
  }
}

export type IValueBoolType = {
  type: 'mesg.types.Value_BoolValue';
  value: {
    bool_value: boolean;
  }
}

export type IValueListType = {
  type: "mesg.types.Value_ListValue",
  value: {
    list_value: {
      values: IValue[]
    }
  }
}

export type IValueMapType = {
  type: "mesg.types.Value_StructValue",
  value: {
    struct_value: IStruct[]
  }
}

export type IValue = {
  Kind: IValueBoolType | IValueNumberType | IValueStringType | IValueNullType | IValueListType | IValueMapType
}

export type IStruct = {
  Key: string
  Value: IValue
}

export const toValue = (value: any): IValueBoolType | IValueNumberType | IValueStringType | IValueNullType | IValueListType | IValueMapType => {
  switch (Object.prototype.toString.call(value)) {
    case '[object Null]':
    case '[object Undefined]':
      return {
        type: "mesg.types.Value_NullValue", value: {}
      } as IValueNullType
    case '[object Object]':
      return {
        type: "mesg.types.Value_StructValue",
        value: {
          struct_value: toStruct(value)
        }
      } as IValueMapType
    case '[object Array]':
      return {
        type: "mesg.types.Value_ListValue",
        value: {
          list_value: {
            values: value.map((x: any) => ({ Kind: toValue(x) }))
          }
        }
      } as IValueListType
    case '[object Number]':
      return {
        type: "mesg.types.Value_NumberValue", value: { number_value: value }
      } as IValueNumberType
    case '[object Boolean]':
      return {
        type: "mesg.types.Value_BoolValue", value: { bool_value: value }
      } as IValueBoolType
    case '[object String]':
      return {
        type: "mesg.types.Value_StringValue", value: { string_value: value }
      } as IValueStringType
    default:
      throw new Error('not supported')
  }
}

export const toStruct = (object: { [key: string]: any }): IStruct[] => {
  return Object.keys(object).reduce((prev, x) => [
    ...prev,
    {
      Key: x,
      Value: {
        Kind: toValue(object[x])
      }
    }
  ], [] as IStruct[])
}