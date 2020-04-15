# MESG js-sdk

[Website](https://mesg.com/) - [Docs](https://docs.mesg.com/) - [Forum](https://forum.mesg.com/) - [Chat](https://discordapp.com/invite/SaZ5HcE) - [Blog](https://blog.mesg.com)

This repository is a list of tools in javascript to interact with MESG. It contains different libraries

- [@mesg/api](./packages/api): This library responsible for the communication with the MESG Engine API.
- [@mesg/orchestrator](./packages/orchestrator): This library let you interact with the orchestrator API.
- [@mesg/service](./packages/service): Handles the connection with the MESG Engine, some authentication, and finally, the functions for your service to listen to tasks sent by the engine or emit events that your service needs to expose to the engine.

# Contribute

## Install

```
npm install
```

## Add a new library in a package

```
npm run lerna -- add [--dev] XXX [packages/yyy]
```

## Build all the packages

```
npm run build
```

## Run test for all the packages

```
npm run test
```
