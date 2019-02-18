mesg-core
=========

MESG Core CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mesg-core.svg)](https://npmjs.org/package/mesg-core)
[![CircleCI](https://circleci.com/gh/mesg-foundation/mesg-core/tree/master.svg?style=shield)](https://circleci.com/gh/mesg-foundation/mesg-core/tree/master)
[![Codecov](https://codecov.io/gh/mesg-foundation/mesg-core/branch/master/graph/badge.svg)](https://codecov.io/gh/mesg-foundation/mesg-core)
[![Downloads/week](https://img.shields.io/npm/dw/mesg-core.svg)](https://npmjs.org/package/mesg-core)
[![License](https://img.shields.io/npm/l/mesg-core.svg)](https://github.com/mesg-foundation/mesg-core/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mesg-core
$ mesg-core COMMAND
running command...
$ mesg-core (-v|--version|version)
mesg-core/0.0.0 darwin-x64 node-v10.8.0
$ mesg-core --help [COMMAND]
USAGE
  $ mesg-core COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mesg-core core:logs`](#mesg-core-corelogs)
* [`mesg-core core:start`](#mesg-core-corestart)
* [`mesg-core core:status`](#mesg-core-corestatus)
* [`mesg-core core:stop`](#mesg-core-corestop)
* [`mesg-core help [COMMAND]`](#mesg-core-help-command)
* [`mesg-core service:delete SERVICE`](#mesg-core-servicedelete-service)
* [`mesg-core service:deploy [SERVICE_PATH_OR_URL]`](#mesg-core-servicedeploy-service-path-or-url)
* [`mesg-core service:detail SERVICE`](#mesg-core-servicedetail-service)
* [`mesg-core service:dev [SERVICE_PATH]`](#mesg-core-servicedev-service-path)
* [`mesg-core service:execute SERVICE TASK`](#mesg-core-serviceexecute-service-task)
* [`mesg-core service:gen-doc [SERVICE_PATH]`](#mesg-core-servicegen-doc-service-path)
* [`mesg-core service:init DIR`](#mesg-core-serviceinit-dir)
* [`mesg-core service:list`](#mesg-core-servicelist)
* [`mesg-core service:logs SERVICE`](#mesg-core-servicelogs-service)
* [`mesg-core service:start SERVICE`](#mesg-core-servicestart-service)
* [`mesg-core service:stop SERVICE`](#mesg-core-servicestop-service)
* [`mesg-core service:validate [SERVICE_PATH]`](#mesg-core-servicevalidate-service-path)

## `mesg-core core:logs`

Show the Core's logs

```
USAGE
  $ mesg-core core:logs

OPTIONS
  -h, --help   show CLI help
  --name=name  (required) [default: core] name of the service running the core
  --tail=tail  [default: -1] Output specified number of lines at the end of logs
```

_See code: [src/commands/core/logs.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/core/logs.ts)_

## `mesg-core core:start`

Start the Core

```
USAGE
  $ mesg-core core:start

OPTIONS
  -h, --help                                       show CLI help
  --log-force-colors                               log force colors
  --log-format=(text|json)                         [default: text] log format
  --log-level=(debug|info|warn|error|fatal|panic)  [default: info] log level
  --name=name                                      (required) [default: core] name of the service running the core
  --version=version                                (required) [default: latest] Version of the core to run
```

_See code: [src/commands/core/start.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/core/start.ts)_

## `mesg-core core:status`

Get the Core's status

```
USAGE
  $ mesg-core core:status

OPTIONS
  -h, --help   show CLI help
  --name=name  (required) [default: core] name of the service running the core
```

_See code: [src/commands/core/status.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/core/status.ts)_

## `mesg-core core:stop`

Stop the Core

```
USAGE
  $ mesg-core core:stop

OPTIONS
  -h, --help   show CLI help
  --name=name  (required) [default: core] name of the service running the core
```

_See code: [src/commands/core/stop.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/core/stop.ts)_

## `mesg-core help [COMMAND]`

display help for mesg-core

```
USAGE
  $ mesg-core help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `mesg-core service:delete SERVICE`

Delete one or many services

```
USAGE
  $ mesg-core service:delete SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  --all        Delete all services
  --keep-data  Do not delete services' persistent data
```

_See code: [src/commands/service/delete.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/delete.ts)_

## `mesg-core service:deploy [SERVICE_PATH_OR_URL]`

Deploy a service

```
USAGE
  $ mesg-core service:deploy [SERVICE_PATH_OR_URL]

ARGUMENTS
  SERVICE_PATH_OR_URL  [default: ./] Path of the service or url to access it

OPTIONS
  -h, --help     show CLI help
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
```

_See code: [src/commands/service/deploy.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/deploy.ts)_

## `mesg-core service:detail SERVICE`

Show details of a deployed service

```
USAGE
  $ mesg-core service:detail SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/service/detail.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/detail.ts)_

## `mesg-core service:dev [SERVICE_PATH]`

Run your service in development mode

```
USAGE
  $ mesg-core service:dev [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help     show CLI help
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
```

_See code: [src/commands/service/dev.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/dev.ts)_

## `mesg-core service:execute SERVICE TASK`

describe the command here

```
USAGE
  $ mesg-core service:execute SERVICE TASK

ARGUMENTS
  SERVICE  Hash or Sid
  TASK     Task key

OPTIONS
  -d, --data=FOO=BAR  data required to run the task
  -h, --help          show CLI help
  -j, --json=json     Path to a JSON file containing the data required to run the task
```

_See code: [src/commands/service/execute.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/execute.ts)_

## `mesg-core service:gen-doc [SERVICE_PATH]`

Generate the documentation for the service in a README.md file

```
USAGE
  $ mesg-core service:gen-doc [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/service/gen-doc.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/gen-doc.ts)_

## `mesg-core service:init DIR`

Initialize a service by creating a mesg.yml and Dockerfile in a dedicated directory.

```
USAGE
  $ mesg-core service:init DIR

ARGUMENTS
  DIR  [default: ./] Create the service in the directory

OPTIONS
  -h, --help               show CLI help
  -t, --template=template  Specify the template URL to use
```

_See code: [src/commands/service/init.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/init.ts)_

## `mesg-core service:list`

List all deployed services

```
USAGE
  $ mesg-core service:list

OPTIONS
  -h, --help         show CLI help
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --sort=sort        property to sort by (prepend '-' for descending)
```

_See code: [src/commands/service/list.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/list.ts)_

## `mesg-core service:logs SERVICE`

Show logs of a service

```
USAGE
  $ mesg-core service:logs SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -d, --dependency=dependency  Name of the dependency to show the logs from
  -h, --help                   show CLI help
```

_See code: [src/commands/service/logs.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/logs.ts)_

## `mesg-core service:start SERVICE`

Start a service

```
USAGE
  $ mesg-core service:start SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/service/start.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/start.ts)_

## `mesg-core service:stop SERVICE`

Stop a service

```
USAGE
  $ mesg-core service:stop SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/service/stop.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/stop.ts)_

## `mesg-core service:validate [SERVICE_PATH]`

Validate a service file. Check the yml format and rules.

```
USAGE
  $ mesg-core service:validate [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/service/validate.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/validate.ts)_
<!-- commandsstop -->
