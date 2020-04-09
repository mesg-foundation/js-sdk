import { Test } from 'tape'
import test from 'tape'
import { encode, decode } from './encoder'

test('encode/decode', function (t: Test) {
  t.plan(1);
  const date = new Date()
  const data = {
    number: 1,
    string: 'hello',
    boolean_false: false,
    boolean_true: true,
    null: null as null,
    undefined: undefined as undefined,
    array: [1, 2, 3],
    array_struct: [{ number: 2, string: '2' }],
    date: date,
    object: {
      number: 3,
      string: '3'
    }
  }
  const res = decode(encode(data))
  t.deepEqual(res, {
    ...data,
    date: date.toJSON()
  })
});