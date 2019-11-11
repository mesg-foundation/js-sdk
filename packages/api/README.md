# @mesg/api

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This library responsible for the communication with the MESG Engine API. It handles the conversion of the data to protobuf messages sent to the GRPC server providing functions with promises for unary calls and event emitters for the different streams that are available in the API.

# Contents

- [Installation](#installation)
- [API](#api)

# Installation

```bash
npm install @mesg/api
```

# API

```javascript
const API = require('@mesg/api')

const api = new API('localhost:50052')
```

You can now access all the different resources of the MESG engine with the following pattern:

```
api.resource.action(parameters)
```

Here are few examples:

- list all the services: `api.service.list({})`
- create a service: `api.service.create({ tasks: ... })`
- get a stream of executions: `api.execution.stream({})`

More details about the different API available [here](https://docs.mesg.com/api/service.html)