import Avg from 'ajv'

export default (schema: object, data: any) => {
  const validate = new Avg({
    jsonPointers: true
  }).compile(schema)
  if (validate(data)) return
  const error = validate.errors.reduce((prev, error) => `${prev}\n${error.dataPath} ${error.message}`, "")
  throw new Error(error)
}
