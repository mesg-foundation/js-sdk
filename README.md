# MESG js-sdk

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This repository is a list of tools in javascript to interact with MESG. It contains different libraries

- [@mesg/cli](./packages/cli/README.md): Command line interface to create/test/deploy services and processes and manage your MESG node.
- [@mesg/api](./packages/api/README.md): This library responsible for the communication with the MESG Engine API.
- [@mesg/service](./packages/service/README.md): Handles the connection with the MESG Engine, some authentication, and finally, the functions for your service to listen to tasks sent by the engine or emit events that your service needs to expose to the engine.
- [@mesg/application](./packages/application/README.md): This library lets you connect to the MESG engine to listen for any event or result that you might be interested too. It also allows you to execute a task, either synchronously or asynchronously.

# Contribute

## Install


=======
```npm install
```


## Add a new library in a package

```
npm run lerna -- add [--dev] XXX [packages/yyy]
```

## Build all the packages

```
npm run lerna -- run build
```

## Run test for all the packages

```
npm run lerna -- run test
```
