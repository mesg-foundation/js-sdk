# @mesg/compiler

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This library let you compile your services and/or processes.

# Contents

- [Installation](#installation)
- [Service](#service)
- [Process](#process)

# Installation

```bash
npm install @mesg/compiler
```

# Service

Warning: The service compilation doesn't produce a ready to publish result. At the end of the compilation you will still need to add the `source` attribute with the hash of the tarball of the sources of your service on IPFS.

```javascript
const fs = require('fs')
const compiler = require('@mesg/compiler')

const serviceFileBuffer = fs.readFileSync('./mesg.yml')

compiler.service(
  serviceFileBuffer // Buffer of your service file `fs.readFileSync('./mesg.yml')`
)
  .then(service => console.log(service))
  .catch(error => console.error("error during the compilation", error))
```

# Process

```javascript
const fs = require('fs')
const { decode } = require('@mesg/api/lib/util/base58')
const compiler = require('@mesg/compiler')

const processFile = fs.readFileSync('./my-process.yml')

compiler.process(
  processFileBuffer,                            // Buffer of your process file `fs.readFileSync('./my-process.yml')`
  async object => decode(object.instanceHash),  // InstanceResolver, can be use to simply decode an instance hash or do some check/deployment
  { "FOO": "BAR" }                              // Map of environment variable that will be replaced in your process
)
  .then(process => console.log(process))
  .catch(error => console.error("error during the compilation", error))
```