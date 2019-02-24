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
* [`mesg-core account:create`](#mesg-core-accountcreate)
* [`mesg-core account:delete ADDRESS`](#mesg-core-accountdelete-address)
* [`mesg-core account:export ADDRESS`](#mesg-core-accountexport-address)
* [`mesg-core account:import`](#mesg-core-accountimport)
* [`mesg-core account:import-private-key PRIVATE_KEY`](#mesg-core-accountimport-private-key-private-key)
* [`mesg-core account:list`](#mesg-core-accountlist)
* [`mesg-core core:logs`](#mesg-core-corelogs)
* [`mesg-core core:start`](#mesg-core-corestart)
* [`mesg-core core:status`](#mesg-core-corestatus)
* [`mesg-core core:stop`](#mesg-core-corestop)
* [`mesg-core help [COMMAND]`](#mesg-core-help-command)
* [`mesg-core marketplace:publish SERVICE_PATH`](#mesg-core-marketplacepublish-service-path)
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

## `mesg-core account:create`

Create a new account

```
USAGE
  $ mesg-core account:create

OPTIONS
  -h, --help               show CLI help
  --passphrase=passphrase  (required) Passphrase to unlock your account
```

_See code: [src/commands/account/create.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/create.ts)_

## `mesg-core account:delete ADDRESS`

Delete an existing account

```
USAGE
  $ mesg-core account:delete ADDRESS

OPTIONS
  -h, --help               show CLI help
  --passphrase=passphrase  (required) Passphrase to unlock your address
```

_See code: [src/commands/account/delete.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/delete.ts)_

## `mesg-core account:export ADDRESS`

Export an existing account

```
USAGE
  $ mesg-core account:export ADDRESS

OPTIONS
  -h, --help               show CLI help
  --passphrase=passphrase  (required) Passphrase to unlock your address
```

_See code: [src/commands/account/export.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/export.ts)_

## `mesg-core account:import`

Import a account

```
USAGE
  $ mesg-core account:import

OPTIONS
  -h, --help               show CLI help
  --account=account        (required) Account saved from a previous account
  --passphrase=passphrase  (required) Passphrase to unlock your address
```

_See code: [src/commands/account/import.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/import.ts)_

## `mesg-core account:import-private-key PRIVATE_KEY`

Import a account from a private key

```
USAGE
  $ mesg-core account:import-private-key PRIVATE_KEY

ARGUMENTS
  PRIVATE_KEY  Private key for your account

OPTIONS
  -h, --help               show CLI help
  --passphrase=passphrase  (required) Passphrase to unlock your address
```

_See code: [src/commands/account/import-private-key.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/import-private-key.ts)_

## `mesg-core account:list`

List all existing accounts

```
USAGE
  $ mesg-core account:list

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

_See code: [src/commands/account/list.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/account/list.ts)_

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

## `mesg-core marketplace:publish SERVICE_PATH`

Publish a service on the MESG Marketplace

```
USAGE
  $ mesg-core marketplace:publish SERVICE_PATH

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -a, --account=account        Account to use
  -h, --help                   show CLI help
  -p, --passphrase=passphrase  (required) Passphrase to decrypt the account
```

_See code: [src/commands/marketplace/publish.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/marketplace/publish.ts)_

## `mesg-core service:delete SERVICE`

Delete one or many services

```
USAGE
  $ mesg-core service:delete SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  --confirm    Confirm delete
  --keep-data  Do not delete services' persistent data

ALIASES
  $ mesg-core service:rm
  $ mesg-core service:destroy
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

ALIASES
  $ mesg-core service:get
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
  -d, --dependency=dependency  Name of the dependency to show the logs from
  -h, --help                   show CLI help
  --env=FOO=BAR                set env defined in mesg.yml (configuration.env)
  --event=event                Filter specific events in the logs
  --no-events                  Remove events from the logs
  --no-results                 Remove results from the logs
  --output=output              Filter specific outputs in the logs
  --task=task                  Filter specific task results in the logs
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

ALIASES
  $ mesg-core service:exec
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

ALIASES
  $ mesg-core service:doc
  $ mesg-core service:docs
```

_See code: [src/commands/service/gen-doc.ts](https://github.com/mesg-foundation/mesg-core/blob/v0.0.0/src/commands/service/gen-doc.ts)_

## `mesg-core service:init DIR`

Initialize a service by creating a mesg.yml and Dockerfile in a dedicated directory.

```
USAGE
  $ mesg-core service:init DIR

ARGUMENTS
  DIR  Create the service in the directory

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
  --event=event                Filter specific events in the logs
  --no-events                  Remove events from the logs
  --no-results                 Remove results from the logs
  --output=output              Filter specific outputs in the logs
  --task=task                  Filter specific task results in the logs
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
