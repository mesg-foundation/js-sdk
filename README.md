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
$ npm install -g mesg-cli
$ mesg-cli COMMAND
running command...
$ mesg-cli (-v|--version|version)
mesg-cli/0.0.0 darwin-x64 node-v10.8.0
$ mesg-cli --help [COMMAND]
USAGE
  $ mesg-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mesg-cli account:create`](#mesg-cli-accountcreate)
* [`mesg-cli account:delete ADDRESS`](#mesg-cli-accountdelete-address)
* [`mesg-cli account:export ADDRESS`](#mesg-cli-accountexport-address)
* [`mesg-cli account:import ACCOUNT`](#mesg-cli-accountimport-account)
* [`mesg-cli account:import-private-key PRIVATE_KEY`](#mesg-cli-accountimport-private-key-private-key)
* [`mesg-cli account:list`](#mesg-cli-accountlist)
* [`mesg-cli autocomplete [SHELL]`](#mesg-cli-autocomplete-shell)
* [`mesg-cli daemon:logs`](#mesg-cli-daemonlogs)
* [`mesg-cli daemon:start`](#mesg-cli-daemonstart)
* [`mesg-cli daemon:status`](#mesg-cli-daemonstatus)
* [`mesg-cli daemon:stop`](#mesg-cli-daemonstop)
* [`mesg-cli help [COMMAND]`](#mesg-cli-help-command)
* [`mesg-cli marketplace:publish SERVICE_PATH`](#mesg-cli-marketplacepublish-service-path)
* [`mesg-cli service:delete SERVICE`](#mesg-cli-servicedelete-service)
* [`mesg-cli service:deploy [SERVICE_PATH_OR_URL]`](#mesg-cli-servicedeploy-service-path-or-url)
* [`mesg-cli service:detail SERVICE`](#mesg-cli-servicedetail-service)
* [`mesg-cli service:dev [SERVICE_PATH]`](#mesg-cli-servicedev-service-path)
* [`mesg-cli service:execute SERVICE TASK`](#mesg-cli-serviceexecute-service-task)
* [`mesg-cli service:gen-doc [SERVICE_PATH]`](#mesg-cli-servicegen-doc-service-path)
* [`mesg-cli service:init DIR`](#mesg-cli-serviceinit-dir)
* [`mesg-cli service:list`](#mesg-cli-servicelist)
* [`mesg-cli service:logs SERVICE`](#mesg-cli-servicelogs-service)
* [`mesg-cli service:start SERVICE`](#mesg-cli-servicestart-service)
* [`mesg-cli service:stop SERVICE`](#mesg-cli-servicestop-service)
* [`mesg-cli service:validate [SERVICE_PATH]`](#mesg-cli-servicevalidate-service-path)

## `mesg-cli account:create`

Create a new account

```
USAGE
  $ mesg-cli account:create

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  (required) Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/create.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/create.ts)_

## `mesg-cli account:delete ADDRESS`

Delete an existing account

```
USAGE
  $ mesg-cli account:delete ADDRESS

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  (required) Passphrase to unlock your account
  --silent

ALIASES
  $ mesg-cli account:rm
  $ mesg-cli account:destroy
```

_See code: [src/commands/account/delete.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/delete.ts)_

## `mesg-cli account:export ADDRESS`

Export an existing account

```
USAGE
  $ mesg-cli account:export ADDRESS

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  (required) Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/export.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/export.ts)_

## `mesg-cli account:import ACCOUNT`

Import a account

```
USAGE
  $ mesg-cli account:import ACCOUNT

ARGUMENTS
  ACCOUNT  Account saved from a previous account

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  (required) Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/import.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/import.ts)_

## `mesg-cli account:import-private-key PRIVATE_KEY`

Import a account from a private key

```
USAGE
  $ mesg-cli account:import-private-key PRIVATE_KEY

ARGUMENTS
  PRIVATE_KEY  Private key for your account

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  (required) Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/import-private-key.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/import-private-key.ts)_

## `mesg-cli account:list`

List all existing accounts

```
USAGE
  $ mesg-cli account:list

OPTIONS
  -h, --help         show CLI help
  -q, --quiet
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --silent
  --sort=sort        property to sort by (prepend '-' for descending)

ALIASES
  $ mesg-cli account:ls
```

_See code: [src/commands/account/list.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/account/list.ts)_

## `mesg-cli autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ mesg-cli autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ mesg-cli autocomplete
  $ mesg-cli autocomplete bash
  $ mesg-cli autocomplete zsh
  $ mesg-cli autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.1.0/src/commands/autocomplete/index.ts)_

## `mesg-cli daemon:logs`

Show the Core's logs

```
USAGE
  $ mesg-cli daemon:logs

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --name=name  (required) [default: core] name of the service running the core
  --silent
  --tail=tail  [default: -1] Output specified number of lines at the end of logs
```

_See code: [src/commands/daemon/logs.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/daemon/logs.ts)_

## `mesg-cli daemon:start`

Start the MESG Core's daemon

```
USAGE
  $ mesg-cli daemon:start

OPTIONS
  -h, --help                                       show CLI help
  -q, --quiet
  --log-force-colors                               log force colors
  --log-format=(text|json)                         [default: text] log format
  --log-level=(debug|info|warn|error|fatal|panic)  [default: info] log level
  --name=name                                      (required) [default: core] name of the service running the core
  --silent
  --version=version                                (required) [default: latest] Version of the core to run
```

_See code: [src/commands/daemon/start.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/daemon/start.ts)_

## `mesg-cli daemon:status`

Get the Core's status

```
USAGE
  $ mesg-cli daemon:status

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --name=name  (required) [default: core] name of the service running the core
  --silent
```

_See code: [src/commands/daemon/status.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/daemon/status.ts)_

## `mesg-cli daemon:stop`

Stop the MESG Core's daemon

```
USAGE
  $ mesg-cli daemon:stop

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --name=name  (required) [default: core] name of the service running the core
  --silent
```

_See code: [src/commands/daemon/stop.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/daemon/stop.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `mesg-cli marketplace:publish SERVICE_PATH`

Publish a service on the MESG Marketplace

```
USAGE
  $ mesg-cli marketplace:publish SERVICE_PATH

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -a, --account=account        Account to use
  -h, --help                   show CLI help
  -p, --passphrase=passphrase  (required) Passphrase to unlock your account
  -q, --quiet
  --silent
```

_See code: [src/commands/marketplace/publish.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/marketplace/publish.ts)_

## `mesg-cli service:delete SERVICE`

Delete one or many services

```
USAGE
  $ mesg-cli service:delete SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --confirm    Confirm delete
  --keep-data  Do not delete services' persistent data
  --silent

ALIASES
  $ mesg-cli service:rm
  $ mesg-cli service:destroy
```

_See code: [src/commands/service/delete.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/delete.ts)_

## `mesg-cli service:deploy [SERVICE_PATH_OR_URL]`

Deploy a service

```
USAGE
  $ mesg-cli service:deploy [SERVICE_PATH_OR_URL]

ARGUMENTS
  SERVICE_PATH_OR_URL  [default: ./] Path of the service or url to access it

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
  --silent
```

_See code: [src/commands/service/deploy.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/deploy.ts)_

## `mesg-cli service:detail SERVICE`

Show details of a deployed service

```
USAGE
  $ mesg-cli service:detail SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent

ALIASES
  $ mesg-cli service:get
```

_See code: [src/commands/service/detail.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/detail.ts)_

## `mesg-cli service:dev [SERVICE_PATH]`

Run your service in development mode

```
USAGE
  $ mesg-cli service:dev [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -d, --dependency=dependency  Name of the dependency to show the logs from
  -h, --help                   show CLI help
  -q, --quiet
  --env=FOO=BAR                set env defined in mesg.yml (configuration.env)
  --event=event                Filter specific events in the logs
  --no-events                  Remove events from the logs
  --no-results                 Remove results from the logs
  --output=output              Filter specific outputs in the logs
  --silent
  --task=task                  Filter specific task results in the logs
```

_See code: [src/commands/service/dev.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/dev.ts)_

## `mesg-cli service:execute SERVICE TASK`

describe the command here

```
USAGE
  $ mesg-cli service:execute SERVICE TASK

ARGUMENTS
  SERVICE  Hash or Sid
  TASK     Task key

OPTIONS
  -d, --data=FOO=BAR  data required to run the task
  -h, --help          show CLI help
  -j, --json=json     Path to a JSON file containing the data required to run the task
  -q, --quiet
  --silent

ALIASES
  $ mesg-cli service:exec
```

_See code: [src/commands/service/execute.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/execute.ts)_

## `mesg-cli service:gen-doc [SERVICE_PATH]`

Generate the documentation for the service in a README.md file

```
USAGE
  $ mesg-cli service:gen-doc [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent

ALIASES
  $ mesg-cli service:doc
  $ mesg-cli service:docs
```

_See code: [src/commands/service/gen-doc.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/gen-doc.ts)_

## `mesg-cli service:init DIR`

Initialize a service by creating a mesg.yml and Dockerfile in a dedicated directory.

```
USAGE
  $ mesg-cli service:init DIR

ARGUMENTS
  DIR  Create the service in the directory

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  -t, --template=template  Specify the template URL to use
  --silent
```

_See code: [src/commands/service/init.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/init.ts)_

## `mesg-cli service:list`

List all deployed services

```
USAGE
  $ mesg-cli service:list

OPTIONS
  -h, --help         show CLI help
  -q, --quiet
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --silent
  --sort=sort        property to sort by (prepend '-' for descending)

ALIASES
  $ mesg-cli service:ls
```

_See code: [src/commands/service/list.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/list.ts)_

## `mesg-cli service:logs SERVICE`

Show logs of a service

```
USAGE
  $ mesg-cli service:logs SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -d, --dependency=dependency  Name of the dependency to show the logs from
  -h, --help                   show CLI help
  -q, --quiet
  --event=event                Filter specific events in the logs
  --no-events                  Remove events from the logs
  --no-results                 Remove results from the logs
  --output=output              Filter specific outputs in the logs
  --silent
  --task=task                  Filter specific task results in the logs
```

_See code: [src/commands/service/logs.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/logs.ts)_

## `mesg-cli service:start SERVICE`

Start a service

```
USAGE
  $ mesg-cli service:start SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent
```

_See code: [src/commands/service/start.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/start.ts)_

## `mesg-cli service:stop SERVICE`

Stop a service

```
USAGE
  $ mesg-cli service:stop SERVICE

ARGUMENTS
  SERVICE  Hash or Sid

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent
```

_See code: [src/commands/service/stop.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/stop.ts)_

## `mesg-cli service:validate [SERVICE_PATH]`

Validate a service file. Check the yml format and rules.

```
USAGE
  $ mesg-cli service:validate [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
  --silent
```

_See code: [src/commands/service/validate.ts](https://github.com/mesg-foundation/cli/blob/v0.0.0/src/commands/service/validate.ts)_
<!-- commandsstop -->
