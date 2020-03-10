# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcli%40X.X.X)

#### Breaking Changes
#### Improvements

- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Add new flag `lcd-port` to all command to configure the port of the LCD server.
- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Use LCD server for all reading (`process:compile`, `process:detail`, `process:list`, `process:logs`, `service:detail`, `service:dev`, `service:execute`, `service:list`, `service:logs`, `service:start`, `service:stop`)
- [#](https://github.com/mesg-foundation/js-sdk/pull/) Add account commands `account:balance`, `account:create`, `account:export`, `account:list`

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
