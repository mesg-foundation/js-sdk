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
mesg-cli/2.0.1 darwin-x64 node-v10.16.3
$ mesg-cli --help [COMMAND]
USAGE
  $ mesg-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mesg-cli account:create ACCOUNT_NAME`](#mesg-cli-accountcreate-account_name)
* [`mesg-cli account:delete ACCOUNT_NAME`](#mesg-cli-accountdelete-account_name)
* [`mesg-cli account:list`](#mesg-cli-accountlist)
* [`mesg-cli daemon:logs`](#mesg-cli-daemonlogs)
* [`mesg-cli daemon:start`](#mesg-cli-daemonstart)
* [`mesg-cli daemon:status`](#mesg-cli-daemonstatus)
* [`mesg-cli daemon:stop`](#mesg-cli-daemonstop)
* [`mesg-cli help [COMMAND]`](#mesg-cli-help-command)
* [`mesg-cli process:compile [PROCESS_FILE]`](#mesg-cli-processcompile-process_file)
* [`mesg-cli process:create DEFINITION`](#mesg-cli-processcreate-definition)
* [`mesg-cli process:delete PROCESS_HASH...`](#mesg-cli-processdelete-process_hash)
* [`mesg-cli process:detail PROCESS_HASH`](#mesg-cli-processdetail-process_hash)
* [`mesg-cli process:dev [PROCESS]`](#mesg-cli-processdev-process)
* [`mesg-cli process:list`](#mesg-cli-processlist)
* [`mesg-cli process:logs PROCESS_HASH`](#mesg-cli-processlogs-process_hash)
* [`mesg-cli service:compile [SERVICE]`](#mesg-cli-servicecompile-service)
* [`mesg-cli service:create DEFINITION`](#mesg-cli-servicecreate-definition)
* [`mesg-cli service:detail SERVICE_HASH`](#mesg-cli-servicedetail-service_hash)
* [`mesg-cli service:dev [SERVICE]`](#mesg-cli-servicedev-service)
* [`mesg-cli service:doc [SERVICE]`](#mesg-cli-servicedoc-service)
* [`mesg-cli service:execute INSTANCE_HASH TASK`](#mesg-cli-serviceexecute-instance_hash-task)
* [`mesg-cli service:init DIR`](#mesg-cli-serviceinit-dir)
* [`mesg-cli service:list`](#mesg-cli-servicelist)
* [`mesg-cli service:logs INSTANCE_HASH`](#mesg-cli-servicelogs-instance_hash)
* [`mesg-cli service:start SERVICE_HASH`](#mesg-cli-servicestart-service_hash)
* [`mesg-cli service:stop INSTANCE_HASH...`](#mesg-cli-servicestop-instance_hash)

## `mesg-cli account:create ACCOUNT_NAME`

Create an account

```
USAGE
  $ mesg-cli account:create ACCOUNT_NAME

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
```

_See code: [src/commands/account/create.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/account/create.ts)_

## `mesg-cli account:delete ACCOUNT_NAME`

Delete an account

```
USAGE
  $ mesg-cli account:delete ACCOUNT_NAME

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
```

_See code: [src/commands/account/delete.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/account/delete.ts)_

## `mesg-cli account:list`

List accounts

```
USAGE
  $ mesg-cli account:list

OPTIONS
  -h, --help         show CLI help
  -p, --port=port    [default: 50052] Port to access the MESG engine
  -q, --quiet        Display only essential information
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --host=host        [default: localhost] Host to access the MESG engine
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --sort=sort        property to sort by (prepend '-' for descending)
```

_See code: [src/commands/account/list.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/account/list.ts)_

## `mesg-cli daemon:logs`

Show the Engine's logs

```
USAGE
  $ mesg-cli daemon:logs

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --[no-]follow    Follow logs
  --host=host      [default: localhost] Host to access the MESG engine
  --name=name      (required) [default: engine] Name of the docker service running the engine
  --tail=tail      [default: -1] Display the last N lines
```

_See code: [src/commands/daemon/logs.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/daemon/logs.ts)_

## `mesg-cli daemon:start`

Start the Engine

```
USAGE
  $ mesg-cli daemon:start

OPTIONS
  -h, --help           show CLI help
  -p, --port=port      [default: 50052] Port to access the MESG engine
  -q, --quiet          Display only essential information
  --host=host          [default: localhost] Host to access the MESG engine
  --name=name          (required) [default: engine] Name of the docker service running the engine
  --p2p-port=p2p-port  (required) [default: 26656] Port to use for p2p interaction
  --path=path          (required) [default: /Users/antho/.mesg] Path to the mesg folder
  --[no-]pull          Pull the latest image of the given version
  --version=version    (required) [default: v0.16] Version of the Engine to run
```

_See code: [src/commands/daemon/start.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/daemon/start.ts)_

## `mesg-cli daemon:status`

Get the Engine's status

```
USAGE
  $ mesg-cli daemon:status

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
  --name=name      (required) [default: engine] Name of the docker service running the engine
```

_See code: [src/commands/daemon/status.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/daemon/status.ts)_

## `mesg-cli daemon:stop`

Stop the Engine

```
USAGE
  $ mesg-cli daemon:stop

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
  --name=name      (required) [default: engine] Name of the docker service running the engine
```

_See code: [src/commands/daemon/stop.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/daemon/stop.ts)_

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

## `mesg-cli process:compile [PROCESS_FILE]`

Compile a process

```
USAGE
  $ mesg-cli process:compile [PROCESS_FILE]

ARGUMENTS
  PROCESS_FILE  Path of a process file

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --account=account        Name of the account
  --dev                    compile the process and automatically deploy and start all the services
  --env=FOO=BAR            Set environment variables
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
```

_See code: [src/commands/process/compile.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/compile.ts)_

## `mesg-cli process:create DEFINITION`

Create a process

```
USAGE
  $ mesg-cli process:create DEFINITION

ARGUMENTS
  DEFINITION  Process's definition. Use process:compile first to build process definition

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/process/create.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/create.ts)_

## `mesg-cli process:delete PROCESS_HASH...`

Delete one or many processes

```
USAGE
  $ mesg-cli process:delete PROCESS_HASH...

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --confirm        Confirm deletion
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/process/delete.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/delete.ts)_

## `mesg-cli process:detail PROCESS_HASH`

Display detailed information on a process

```
USAGE
  $ mesg-cli process:detail PROCESS_HASH

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/process/detail.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/detail.ts)_

## `mesg-cli process:dev [PROCESS]`

Run a process in development mode

```
USAGE
  $ mesg-cli process:dev [PROCESS]

ARGUMENTS
  PROCESS  [default: ./] Path of the process

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --account=account        Name of the account
  --dev                    compile the process and automatically deploy and start all the services
  --env=FOO=BAR            Set environment variables
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
```

_See code: [src/commands/process/dev.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/dev.ts)_

## `mesg-cli process:list`

List processes

```
USAGE
  $ mesg-cli process:list

OPTIONS
  -h, --help         show CLI help
  -p, --port=port    [default: 50052] Port to access the MESG engine
  -q, --quiet        Display only essential information
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --host=host        [default: localhost] Host to access the MESG engine
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --sort=sort        property to sort by (prepend '-' for descending)
```

_See code: [src/commands/process/list.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/list.ts)_

## `mesg-cli process:logs PROCESS_HASH`

Log the executions related to a process

```
USAGE
  $ mesg-cli process:logs PROCESS_HASH

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/process/logs.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/process/logs.ts)_

## `mesg-cli service:compile [SERVICE]`

Compile a service and upload its source to IPFS server

```
USAGE
  $ mesg-cli service:compile [SERVICE]

ARGUMENTS
  SERVICE  [default: ./] Path or url of a service

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/compile.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/compile.ts)_

## `mesg-cli service:create DEFINITION`

Create a service

```
USAGE
  $ mesg-cli service:create DEFINITION

ARGUMENTS
  DEFINITION  Service's definition. Use service:compile first to build service definition

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --account=account        Name of the account
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
  --start                  Automatically start the service once created
```

_See code: [src/commands/service/create.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/create.ts)_

## `mesg-cli service:detail SERVICE_HASH`

Display detailed information on a service

```
USAGE
  $ mesg-cli service:detail SERVICE_HASH

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/detail.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/detail.ts)_

## `mesg-cli service:dev [SERVICE]`

Run a service in development mode

```
USAGE
  $ mesg-cli service:dev [SERVICE]

ARGUMENTS
  SERVICE  [default: ./] Path or url of a service

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  --account=account        Name of the account
  --env=FOO=BAR            Set environment variables
  --host=host              [default: localhost] Host to access the MESG engine
  --passphrase=passphrase  Passphrase of the account
  --start                  Automatically start the service once created
```

_See code: [src/commands/service/dev.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/dev.ts)_

## `mesg-cli service:doc [SERVICE]`

Generate documentation for service and print it on stdout

```
USAGE
  $ mesg-cli service:doc [SERVICE]

ARGUMENTS
  SERVICE  [default: ./] Path of a service

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  -s, --save       Save to default readme file
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/doc.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/doc.ts)_

## `mesg-cli service:execute INSTANCE_HASH TASK`

Execute a task on a running service

```
USAGE
  $ mesg-cli service:execute INSTANCE_HASH TASK

ARGUMENTS
  INSTANCE_HASH
  TASK           Task key

OPTIONS
  -d, --data=key=value  Task inputs
  -h, --help            show CLI help
  -j, --json=json       Path to a JSON file containing the task inputs
  -p, --port=port       [default: 50052] Port to access the MESG engine
  -q, --quiet           Display only essential information
  --host=host           [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/execute.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/execute.ts)_

## `mesg-cli service:init DIR`

Initialize a service from a template

```
USAGE
  $ mesg-cli service:init DIR

ARGUMENTS
  DIR  Directory to initialize a service into

OPTIONS
  -h, --help               show CLI help
  -p, --port=port          [default: 50052] Port to access the MESG engine
  -q, --quiet              Display only essential information
  -t, --template=template  Specify the template URL to use
  --host=host              [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/init.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/init.ts)_

## `mesg-cli service:list`

List running services

```
USAGE
  $ mesg-cli service:list

OPTIONS
  -h, --help         show CLI help
  -p, --port=port    [default: 50052] Port to access the MESG engine
  -q, --quiet        Display only essential information
  -x, --extended     show extra columns
  --columns=columns  only show provided columns (comma-separated)
  --csv              output is csv format
  --filter=filter    filter property by partial string matching, ex: name=foo
  --host=host        [default: localhost] Host to access the MESG engine
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --sort=sort        property to sort by (prepend '-' for descending)
```

_See code: [src/commands/service/list.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/list.ts)_

## `mesg-cli service:logs INSTANCE_HASH`

Fetch the logs of a service

```
USAGE
  $ mesg-cli service:logs INSTANCE_HASH

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --event=event    Display a specific event
  --[no-]events    Display events
  --[no-]follow    Follow log output
  --host=host      [default: localhost] Host to access the MESG engine
  --[no-]results   Display results
  --tail=tail      [default: -1] Display the last N lines
  --task=task      Display a specific task results
```

_See code: [src/commands/service/logs.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/logs.ts)_

## `mesg-cli service:start SERVICE_HASH`

Start a service by creating a new instance

```
USAGE
  $ mesg-cli service:start SERVICE_HASH

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --env=FOO=BAR    Set environment variables
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/start.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/start.ts)_

## `mesg-cli service:stop INSTANCE_HASH...`

Stop one or more running service

```
USAGE
  $ mesg-cli service:stop INSTANCE_HASH...

OPTIONS
  -h, --help       show CLI help
  -p, --port=port  [default: 50052] Port to access the MESG engine
  -q, --quiet      Display only essential information
  --confirm        Confirm deletion
  --delete-data    Delete running service persistent data
  --host=host      [default: localhost] Host to access the MESG engine
```

_See code: [src/commands/service/stop.ts](https://github.com/mesg-foundation/cli/blob/v2.0.1/src/commands/service/stop.ts)_
<!-- commandsstop -->
