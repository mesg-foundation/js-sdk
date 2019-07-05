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
$ npm install -g mesg-cli
$ mesg-cli COMMAND
running command...
$ mesg-cli (-v|--version|version)
mesg-cli/1.1.0-beta.1 darwin-x64 node-v10.16.0
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
* [`mesg-cli account:import-private-key PRIVATE_KEY`](#mesg-cli-accountimport-private-key-private_key)
* [`mesg-cli account:list`](#mesg-cli-accountlist)
* [`mesg-cli daemon:logs`](#mesg-cli-daemonlogs)
* [`mesg-cli daemon:start`](#mesg-cli-daemonstart)
* [`mesg-cli daemon:status`](#mesg-cli-daemonstatus)
* [`mesg-cli daemon:stop`](#mesg-cli-daemonstop)
* [`mesg-cli help [COMMAND]`](#mesg-cli-help-command)
* [`mesg-cli marketplace:create-offer SID`](#mesg-cli-marketplacecreate-offer-sid)
* [`mesg-cli marketplace:publish SERVICE_PATH`](#mesg-cli-marketplacepublish-service_path)
* [`mesg-cli marketplace:purchase SID OFFER_ID`](#mesg-cli-marketplacepurchase-sid-offer_id)
* [`mesg-cli service:compile [SERVICE_PATH_OR_URL]`](#mesg-cli-servicecompile-service_path_or_url)
* [`mesg-cli service:create DEFINITION`](#mesg-cli-servicecreate-definition)
* [`mesg-cli service:delete SERVICE_HASH`](#mesg-cli-servicedelete-service_hash)
* [`mesg-cli service:detail SERVICE_HASH`](#mesg-cli-servicedetail-service_hash)
* [`mesg-cli service:dev [SERVICE_PATH]`](#mesg-cli-servicedev-service_path)
* [`mesg-cli service:doc [SERVICE_PATH]`](#mesg-cli-servicedoc-service_path)
* [`mesg-cli service:execute INSTANCE_HASH TASK`](#mesg-cli-serviceexecute-instance_hash-task)
* [`mesg-cli service:init DIR`](#mesg-cli-serviceinit-dir)
* [`mesg-cli service:list`](#mesg-cli-servicelist)
* [`mesg-cli service:logs INSTANCE_HASH`](#mesg-cli-servicelogs-instance_hash)
* [`mesg-cli service:start SERVICE_HASH`](#mesg-cli-servicestart-service_hash)
* [`mesg-cli service:stop INSTANCE_HASH`](#mesg-cli-servicestop-instance_hash)

## `mesg-cli account:create`

Create a new account

```
USAGE
  $ mesg-cli account:create

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/create.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/create.ts)_

## `mesg-cli account:delete ADDRESS`

Delete an existing account

```
USAGE
  $ mesg-cli account:delete ADDRESS

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/delete.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/delete.ts)_

## `mesg-cli account:export ADDRESS`

Export an existing account

```
USAGE
  $ mesg-cli account:export ADDRESS

OPTIONS
  -h, --help               show CLI help
  -q, --quiet
  --passphrase=passphrase  Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/export.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/export.ts)_

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
  --passphrase=passphrase  Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/import.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/import.ts)_

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
  --passphrase=passphrase  Passphrase to unlock your account
  --silent
```

_See code: [src/commands/account/import-private-key.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/import-private-key.ts)_

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

_See code: [src/commands/account/list.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/account/list.ts)_

## `mesg-cli daemon:logs`

Show the Engine's logs

```
USAGE
  $ mesg-cli daemon:logs

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --[no-]follow  Follow logs
  --name=name    (required) [default: engine] name of the service running the engine
  --silent
  --tail=tail    [default: -1] Output specified number of lines at the end of logs
```

_See code: [src/commands/daemon/logs.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/daemon/logs.ts)_

## `mesg-cli daemon:start`

Start the MESG Engine's daemon

```
USAGE
  $ mesg-cli daemon:start

OPTIONS
  -h, --help                                       show CLI help
  -q, --quiet
  --log-force-colors                               log force colors
  --log-format=(text|json)                         [default: text] log format
  --log-level=(debug|info|warn|error|fatal|panic)  [default: info] log level
  --name=name                                      (required) [default: engine] name of the service running the engine
  --silent
  --version=version                                (required) [default: v0.10.1] Version of the engine to run
```

_See code: [src/commands/daemon/start.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/daemon/start.ts)_

## `mesg-cli daemon:status`

Get the Engine's status

```
USAGE
  $ mesg-cli daemon:status

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --name=name  (required) [default: engine] name of the service running the engine
  --silent
```

_See code: [src/commands/daemon/status.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/daemon/status.ts)_

## `mesg-cli daemon:stop`

Stop the MESG Engine's daemon

```
USAGE
  $ mesg-cli daemon:stop

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --name=name  (required) [default: engine] name of the service running the engine
  --silent
```

_See code: [src/commands/daemon/stop.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/daemon/stop.ts)_

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

## `mesg-cli marketplace:create-offer SID`

Create a new offer on a service on the MESG Marketplace

```
USAGE
  $ mesg-cli marketplace:create-offer SID

ARGUMENTS
  SID  SID of the service on the MESG Marketplace

OPTIONS
  -a, --account=account        Account to use
  -h, --help                   show CLI help
  -p, --passphrase=passphrase  Passphrase to unlock your account
  -q, --quiet
  --duration=duration          (required) Duration (in second) of the offer to create
  --price=price                (required) Price (in MESG token) of the offer to create
  --silent
```

_See code: [src/commands/marketplace/create-offer.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/marketplace/create-offer.ts)_

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
  -p, --passphrase=passphrase  Passphrase to unlock your account
  -q, --quiet
  --silent
```

_See code: [src/commands/marketplace/publish.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/marketplace/publish.ts)_

## `mesg-cli marketplace:purchase SID OFFER_ID`

Purchase a service on the MESG Marketplace

```
USAGE
  $ mesg-cli marketplace:purchase SID OFFER_ID

ARGUMENTS
  SID       ID of the service on the MESG Marketplace
  OFFER_ID  ID of the offer on the MESG Marketplace

OPTIONS
  -a, --account=account        Account to use
  -h, --help                   show CLI help
  -p, --passphrase=passphrase  Passphrase to unlock your account
  -q, --quiet
  --silent
```

_See code: [src/commands/marketplace/purchase.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/marketplace/purchase.ts)_

## `mesg-cli service:compile [SERVICE_PATH_OR_URL]`

Compile a service and upload its source to IPFS

```
USAGE
  $ mesg-cli service:compile [SERVICE_PATH_OR_URL]

ARGUMENTS
  SERVICE_PATH_OR_URL  [default: ./] Path of the service or url to access it

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent
```

_See code: [src/commands/service/compile.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/compile.ts)_

## `mesg-cli service:create DEFINITION`

Create a service

```
USAGE
  $ mesg-cli service:create DEFINITION

ARGUMENTS
  DEFINITION  Service's definition. Use service:compile first to build service definition

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent
```

_See code: [src/commands/service/create.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/create.ts)_

## `mesg-cli service:delete SERVICE_HASH`

Delete one or many services

```
USAGE
  $ mesg-cli service:delete SERVICE_HASH

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --confirm    Confirm delete
  --silent

ALIASES
  $ mesg-cli service:rm
  $ mesg-cli service:destroy
```

_See code: [src/commands/service/delete.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/delete.ts)_

## `mesg-cli service:detail SERVICE_HASH`

Show details of a service

```
USAGE
  $ mesg-cli service:detail SERVICE_HASH

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  --silent
```

_See code: [src/commands/service/detail.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/detail.ts)_

## `mesg-cli service:dev [SERVICE_PATH]`

Run your service in development mode

```
USAGE
  $ mesg-cli service:dev [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
  --silent
```

_See code: [src/commands/service/dev.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/dev.ts)_

## `mesg-cli service:doc [SERVICE_PATH]`

Generate the documentation for the service in a README.md file

```
USAGE
  $ mesg-cli service:doc [SERVICE_PATH]

ARGUMENTS
  SERVICE_PATH  [default: ./] Path of the service

OPTIONS
  -h, --help   show CLI help
  -q, --quiet
  -s, --save   Save to default readme file
  --silent

ALIASES
  $ mesg-cli service:doc
  $ mesg-cli service:docs
```

_See code: [src/commands/service/doc.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/doc.ts)_

## `mesg-cli service:execute INSTANCE_HASH TASK`

Execute a task on a specific service's instance

```
USAGE
  $ mesg-cli service:execute INSTANCE_HASH TASK

ARGUMENTS
  INSTANCE_HASH
  TASK           Task key

OPTIONS
  -d, --data=key=value  data required to run the task
  -h, --help            show CLI help
  -j, --json=json       Path to a JSON file containing the data required to run the task
  -q, --quiet
  --silent
```

_See code: [src/commands/service/execute.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/execute.ts)_

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

_See code: [src/commands/service/init.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/init.ts)_

## `mesg-cli service:list`

List all instances

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
```

_See code: [src/commands/service/list.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/list.ts)_

## `mesg-cli service:logs INSTANCE_HASH`

Show logs of a service

```
USAGE
  $ mesg-cli service:logs INSTANCE_HASH

OPTIONS
  -h, --help      show CLI help
  -q, --quiet
  --event=event   Only display a specific event
  --[no-]events   Don't display events
  --[no-]follow   Continuously display logs
  --[no-]results  Don't display results
  --silent
  --tail=tail     [default: -1] Output only specified number of lines
  --task=task     Only display a specific task results
```

_See code: [src/commands/service/logs.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/logs.ts)_

## `mesg-cli service:start SERVICE_HASH`

Start a service by creating a new instance

```
USAGE
  $ mesg-cli service:start SERVICE_HASH

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --env=FOO=BAR  set env defined in mesg.yml (configuration.env)
  --silent
```

_See code: [src/commands/service/start.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/start.ts)_

## `mesg-cli service:stop INSTANCE_HASH`

Stop a service by deleting a specific instance

```
USAGE
  $ mesg-cli service:stop INSTANCE_HASH

OPTIONS
  -h, --help     show CLI help
  -q, --quiet
  --confirm      Confirm delete
  --delete-data  Delete instances' persistent data
  --silent
```

_See code: [src/commands/service/stop.ts](https://github.com/mesg-foundation/cli/blob/v1.1.0-beta.1/src/commands/service/stop.ts)_
<!-- commandsstop -->
