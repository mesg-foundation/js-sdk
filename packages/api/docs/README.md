[@mesg/api](README.md) › [Globals](globals.md)

# @mesg/api

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
const api = new API('http://localhost:1317')
```

You can now use the following modules from the API with one of the following:

- [`api.service`](./docs/classes/service.md)
- [`api.instance`](./docs/classes/instance.md)
- [`api.runner`](./docs/classes/runner.md)
- [`api.process`](./docs/classes/process.md)
- [`api.execution`](./docs/classes/execution.md)
- [`api.ownership`](./docs/classes/ownership.md)
- [`api.account`](./docs/classes/account.md)
