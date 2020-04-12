mesg-cli
=========

MESG Engine CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mesg-cli.svg)](https://npmjs.org/package/mesg-cli)
[![Downloads/week](https://img.shields.io/npm/dw/mesg-cli.svg)](https://npmjs.org/package/mesg-cli)
[![License](https://img.shields.io/npm/l/mesg-cli.svg)](https://github.com/mesg-foundation/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @mesg/cli
$ mesg-cli COMMAND
running command...
$ mesg-cli (-v|--version|version)
@mesg/cli/0.4.2 darwin-x64 node-v12.16.1
$ mesg-cli --help [COMMAND]
USAGE
  $ mesg-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mesg-cli deploy:service [PATH]`](#mesg-cli-deployservice-path)
* [`mesg-cli dev [PATH]`](#mesg-cli-dev-path)
* [`mesg-cli help [COMMAND]`](#mesg-cli-help-command)
* [`mesg-cli login`](#mesg-cli-login)
* [`mesg-cli logout`](#mesg-cli-logout)
* [`mesg-cli process:dev [PROCESS_FILE]`](#mesg-cli-processdev-process_file)
* [`mesg-cli service:dev [PATH]`](#mesg-cli-servicedev-path)
* [`mesg-cli service:doc [SERVICE_PATH]`](#mesg-cli-servicedoc-service_path)
* [`mesg-cli service:execute RUNNER_HASH TASK`](#mesg-cli-serviceexecute-runner_hash-task)
* [`mesg-cli service:init DIR`](#mesg-cli-serviceinit-dir)

## `mesg-cli deploy:service [PATH]`

Deploy a service

```
USAGE
  $ mesg-cli deploy:service [PATH]

ARGUMENTS
  PATH  [default: ./] Path or url of a service

OPTIONS
  --password=password  Password of your account
```

_See code: [src/commands/deploy/service.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/deploy/service.ts)_

## `mesg-cli dev [PATH]`

Start a dev environment for your project

```
USAGE
  $ mesg-cli dev [PATH]

ARGUMENTS
  PATH  [default: ./] Path of your project

OPTIONS
  --pull
  --version=version  [default: v0.19]
```

_See code: [src/commands/dev.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/dev.ts)_

## `mesg-cli help [COMMAND]`

display help for mesg-cli

```
USAGE
  $ mesg-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `mesg-cli login`

Login to a registry

```
USAGE
  $ mesg-cli login

OPTIONS
  --email=email
  --password=password
```

_See code: [src/commands/login.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/login.ts)_

## `mesg-cli logout`

Logout from a registry

```
USAGE
  $ mesg-cli logout
```

_See code: [src/commands/logout.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/logout.ts)_

## `mesg-cli process:dev [PROCESS_FILE]`

Run a process in a local development environment

```
USAGE
  $ mesg-cli process:dev [PROCESS_FILE]

ARGUMENTS
  PROCESS_FILE  Path of a process file

OPTIONS
  --env=FOO=BAR      Environment variables to inject to the process
  --pull
  --version=version  [default: v0.19]
```

_See code: [src/commands/process/dev.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/process/dev.ts)_

## `mesg-cli service:dev [PATH]`

Run a service in a local development environment

```
USAGE
  $ mesg-cli service:dev [PATH]

ARGUMENTS
  PATH  [default: ./] Path or url of a service

OPTIONS
  --env=FOO=BAR      Environment variables to inject to the service
  --pull
  --version=version  [default: v0.19]
```

_See code: [src/commands/service/dev.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/service/dev.ts)_

## `mesg-cli service:doc [SERVICE_PATH]`

Generate documentation for service and print it to stdout

```
USAGE
  $ mesg-cli service:doc [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of a service

OPTIONS
  -s, --save  Save to default readme file
```

_See code: [src/commands/service/doc.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/service/doc.ts)_

## `mesg-cli service:execute RUNNER_HASH TASK`

Execute a task on a running service

```
USAGE
  $ mesg-cli service:execute RUNNER_HASH TASK

ARGUMENTS
  RUNNER_HASH  The hash of the runner that will execute this execution
  TASK         Task key

OPTIONS
  -d, --data=key=value   Task inputs
  -j, --json=json        Path to a JSON file containing the task inputs
  --eventHash=eventHash  Event hash to create the execution with
```

_See code: [src/commands/service/execute.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/service/execute.ts)_

## `mesg-cli service:init DIR`

Initialize a service from a template

```
USAGE
  $ mesg-cli service:init DIR

ARGUMENTS
  DIR  Directory to initialize a service into

OPTIONS
  -t, --template=template  Specify the template URL to use
```

_See code: [src/commands/service/init.ts](https://github.com/mesg-foundation/js-sdk/blob/v0.4.2/src/commands/service/init.ts)_
<!-- commandsstop -->
