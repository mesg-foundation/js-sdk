# @mesg/service

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This library handles the connection with the MESG Engine, some authentication, and finally, the functions for your service to listen to tasks sent by the engine or emit events that your service needs to expose to the engine.

# Contents

- [Installation](#installation)
- [Service](#service)
  - [Task](#task)
  - [Event](#event)

# Installation

```bash
npm install @mesg/service
```

# Service

```javascript
const Service = require('@mesg/service')

const mesg = new Service()
```

## Task

The service have to call `mesg.listenTask` to start listening for task to execute by passing an object containing the tasks' key and function.

```javascript
mesg.listenTask({
  'TASK_1_KEY': (inputs) => {
    // Function of the task 1
    // Can directly throw error
    if (inputs.foo === undefined) {
      throw new Error('foo is undefined')
    }
    // Return an object
    return { foo: inputs.a + 'bar' }
  }, 
  'TASK_2_KEY': async (inputs) => {
    // Function of the task 2
    // Return an Promise containing an object
    const response = await fetch('...')
    return response.json()
  },
})
```

The task functions accept `inputs` as parameter and returns the `outputs` as object or Promise of object.
The task function can throw an Error in case of error. The lib will catch it and send it to the MESG Engine.

## Event

To emit an event, the service should call the `mesg.emitEvent` function with the event's key and event's data as parameters. This function returns a `Promise`.

```javascript
mesg.emitEvent('EVENT_KEY', { foo: 'bar' })
```
