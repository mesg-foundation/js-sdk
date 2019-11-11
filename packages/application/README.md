# mesg-js

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This library lets you connect to the MESG engine to listen for any event or result that you might be interested too. It also allows you to execute a task, either synchronously or asynchronously.

# Contents

- [Installation](#installation)
- [Application](#application)
  - [Resolve SID](#resolve-sid)
  - [Listen events](#listen-events)
  - [Listen results](#listen-results)
  - [Execute task](#execute-task)
  - [Execute task and wait result](#execute-task-and-wait-result)

# Installation

```bash
npm i @mesg/application
```

# Application

Require mesg-js as an application:

```javascript
const Application = require('@mesg/application')

const mesg = new Application()
```

## MESG Engine endpoint

By default, the library connects to the MESG Engine from the endpoint `localhost:50052`.

## Resolve SID

Instead of hard-coding `instanceHash` in your application's env, your application can resolve dynamically using the service's SID.

```javascript
const instanceHash = await mesg.resolve('SID_OF_THE_SERVICE')

const result = await mesg.executeTaskAndWaitResult({
  instanceHash,
  .....
})
```

## Listen events

Listen events from a service.

```javascript
const instanceHash = await mesg.resolve('SID_OF_THE_SERVICE')

mesg.listenEvent({
  filter: {
    instanceHash: instanceHash,
    key: 'EVENT_KEY' // optional
  }
})
.on('data', (event) => {
  console.log('an event received:', event.key, mesg.decodeData(event.data))
})
```

## Listen results

Listen results from a service.

```javascript
const instanceHash = await mesg.resolve('SID_OF_THE_SERVICE')

mesg.listenResult({
  filter: {
    instanceHash: instanceHash,
    taskKey: 'TASK_KEY_FILTER', // optional
    tags: ['TAG_FILTER'] // optional
  }
})
.on('data', (result) => {
  if (result.error) {
    console.error('an error has occurred:', result.error)
    return
  }
  console.log('a result received:', mesg.decodeData(result.outputs))
})
```

## Execute task

Execute task on a service.

```javascript
const instanceHash = await mesg.resolve('SID_OF_THE_SERVICE')

const execution = await mesg.executeTask({
  instanceHash: instanceHash,
  taskKey: 'TASK_KEY',
  inputs: mesg.encodeData({ key: 'INPUT_DATA' }),
  tags: ['ASSOCIATE_TAG'] // optional
})
console.log('task in progress with execution:', execution.hash)
```

## Execute task and wait result

Execute task on a service and wait for its result.
This can be considered as a shortcut for using both `executeTask()` and `listenResult()` at same time.

```javascript
const instanceHash = await mesg.resolve('SID_OF_THE_SERVICE')

const result = await mesg.executeTaskAndWaitResult({
  instanceHash: instanceHash,
  taskKey: 'TASK_KEY',
  inputs: mesg.encodeData({ key: 'INPUT_DATA' }),
  tags: ['ASSOCIATE_TAG'] // optional
})
if (result.error) {
  console.error('an error has occurred:', result.error)
  throw new Error(result.error)
}
console.log('a result received:', mesg.decodeData(result.outputs))
```