import * as bs58 from './base58'
import {serializeExecution, serializeService, hashBase58} from './hash'

const execSer = serializeExecution({
  instanceHash: bs58.decode('5M8pQvBCPYwzwxe2bZUbV2g8bSgpsotp441xYvVBNMhd'),
  taskKey: 'taskKey',
  inputs: {
    fields: {
      "a": {
        stringValue: "b",
      },
      "b": {
        numberValue: 3.14159265359,
      },
      "c": {
        boolValue: true,
      },
      "d": {
        listValue: {
          values: [{
            nullValue: 0,
          }, {
            stringValue: "hello",
          }],
        },
      },
      "e": {
        nullValue: 0,
      },
      "f": {
        structValue: {
          fields: {
            "a": {
              stringValue: "hello",
            },
          },
        },
      },
    },
  },
})
console.log('execution', execSer)
console.log(hashBase58(execSer))

const serviceSer = serializeService({
  sid: "hello",
  name: "world",
  events: [{
    key: "event",
    data: [{
      key: "key",
      type: "Number",
      optional: true,
    }],
  }],
  tasks: [{
    key: "task",
    inputs: [{
      key: "key",
      type: "Number",
      optional: true,
    }],
    outputs: [{
      key: "key",
      type: "Number",
      optional: true,
    }],
  }],
})
console.log('service', serviceSer)
console.log(hashBase58(serviceSer))