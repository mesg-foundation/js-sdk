# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%40X.X.X)

#### Breaking Changes

- [#188](https://github.com/mesg-foundation/js-sdk/pull/188) Rewrite of the CLI, new UX for dev commands and command deleted
This is a major breaking change on the CLI.
The following commands are deleted:
- `daemon:logs`
- `daemon:start`
- `daemon:status`
- `daemon:stop`
- `process:compile`
- `process:create`
- `process:delete`
- `process:detail`
- `process:list`
- `process:logs`
- `service:compile`
- `service:create`
- `service:detail`
- `service:list`
- `service:logs`
- `service:start`
- `service:stop`

Commands `service:dev` and `process:dev` are now smarter and automatically start a local environment all set up with a default account for local development.

#### Improvements

- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Add new flag `lcd-port` to all command to configure the port of the LCD server.
- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Use LCD server for all reading (`process:compile`, `process:detail`, `process:list`, `process:logs`, `service:detail`, `service:dev`, `service:execute`, `service:list`, `service:logs`, `service:start`, `service:stop`)
- [#183](https://github.com/mesg-foundation/js-sdk/pull/183) Add account commands `account:balance`, `account:create`, `account:export`, `account:list`
- [#181](https://github.com/mesg-foundation/js-sdk/pull/181) Add util to get hash from a transaction log
- [#186](https://github.com/mesg-foundation/js-sdk/pull/186) Create/delete process based on LCD endpoint
- [#187](https://github.com/mesg-foundation/js-sdk/pull/187) Add `account:transfer` command
- [#187](https://github.com/mesg-foundation/js-sdk/pull/187) Transfer token when creating a process

#### Bug fixes

## [v0.3.0](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%400.3.0)

#### Improvements

- [#177](https://github.com/mesg-foundation/js-sdk/pull/177) Open LCD port when starting the daemon
- [#178](https://github.com/mesg-foundation/js-sdk/pull/178) Start the engine 0.19 version by default

#### Bug fixes

- [#171](https://github.com/mesg-foundation/js-sdk/pull/171) Fix docker filtering issue on docker services prefixed with "engine"

## [v0.2.0](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%400.2.0)

#### Improvements

- [#168](https://github.com/mesg-foundation/js-sdk/pull/168) Fetch and configure the engine to start on a specific network.
- [#173](https://github.com/mesg-foundation/js-sdk/pull/173) Add module=orchestrator engine errors to process:logs.

## [v0.1.3](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%400.1.3)

#### Bug fixes

- [#163](https://github.com/mesg-foundation/js-sdk/pull/163) Fixes encoding of hash in not existing task error in command `service:execute`.

## [v0.1.2](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%400.1.2)

- [#161](https://github.com/mesg-foundation/js-sdk/pull/161) Use Engine v0.18.

## [v0.1.1](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%400.1.1)

#### Improvements

- [#148](https://github.com/mesg-foundation/js-sdk/pull/148) Update process's compilation based on the latest API

This library has been moved from https://github.com/mesg-foundation/cli, please check https://github.com/mesg-foundation/cli/blob/master/CHANGELOG.md for previous updates
