import Avg from 'ajv'

export default (schema: object, data: any) => {
  const validate = new Avg().compile(schema)
  if (validate(data)) return
  // Get the error with the longest schema path to avoid having a list of errors that might not be related
  const error = validate.errors.reduce((prev, error) => prev
    ? prev.schemaPath.split('/').length > error.schemaPath.split('/').length
      ? prev
      : error
    : error
  , null)
  if (!error) return
  throw new Error(`${error.dataPath} ${error.message}`)
}
