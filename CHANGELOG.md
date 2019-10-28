# Changelog

## [Unreleased](https://github.com/mesg-foundation/cli/compare/master...dev)

#### Breaking Changes
#### Added
#### Changed
#### Fixed
#### Removed


## [v2.0.1](https://github.com/mesg-foundation/cli/releases/tag/v2.0.1)

#### Fixed

- ([#224](https://github.com/mesg-foundation/cli/pull/244)) Fix issue with flags on the process:compile command.

## [v2.0.0](https://github.com/mesg-foundation/cli/releases/tag/v2.0.0)

#### Breaking Changes

- ([#157](https://github.com/mesg-foundation/cli/pull/157)) Add new account commands.
- ([#197](https://github.com/mesg-foundation/cli/pull/197)) Remove core api, account commands and marketplace commands.
- ([#209](https://github.com/mesg-foundation/cli/pull/209)) Remove command service:delete.

#### Added

- ([#181](https://github.com/mesg-foundation/cli/pull/181)) Ask credentials in service create and delete.
- ([#207](https://github.com/mesg-foundation/cli/pull/207)) Add credential and new api.
- ([#212](https://github.com/mesg-foundation/cli/pull/212)) Add account selection prompt.
- ([#219](https://github.com/mesg-foundation/cli/pull/219)) Add instance hash to service dev command.

#### Changed

- ([#182](https://github.com/mesg-foundation/cli/pull/182)) Update packages dependencies.
- ([#198](https://github.com/mesg-foundation/cli/pull/198)) Update description of service path.
- ([#242](https://github.com/mesg-foundation/cli/pull/242)) Update engine to v0.16.
- ([#243](https://github.com/mesg-foundation/cli/pull/243)) Update mesg-js to v5.0.0.

#### Fixed

- ([#206](https://github.com/mesg-foundation/cli/pull/206)) Fix issue with empty accounts.
- ([#208](https://github.com/mesg-foundation/cli/pull/208)) Fix CI.
- ([#213](https://github.com/mesg-foundation/cli/pull/213)) Improve dev command.
- ([#214](https://github.com/mesg-foundation/cli/pull/214)) Fix list commands empty result.
- ([#215](https://github.com/mesg-foundation/cli/pull/215)) Update command process:dev.
- ([#216](https://github.com/mesg-foundation/cli/pull/216)) Update command daemon:start.
- ([#240](https://github.com/mesg-foundation/cli/pull/240)) Pass flags from commands to commands.
- ([#241](https://github.com/mesg-foundation/cli/pull/241)) Wait for engine's api to start on the command daemon:start.

#### Removed

- ([#184](https://github.com/mesg-foundation/cli/pull/184)) Remove useless account flag in account commands.

## [v1.4.0](https://github.com/mesg-foundation/cli/releases/tag/v1.4.0)

#### Added

- ([#153](https://github.com/mesg-foundation/cli/pull/153)) Add support of constant mapping in processes.
- ([#160](https://github.com/mesg-foundation/cli/pull/160)) Make service compilation from remote deterministic.
- ([#161](https://github.com/mesg-foundation/cli/pull/161)) Add key to process:list.
- ([#162](https://github.com/mesg-foundation/cli/pull/162)) Auto-update of the version of the Engine.
- ([#154](https://github.com/mesg-foundation/cli/pull/154)) Add process log command.
- ([#155](https://github.com/mesg-foundation/cli/pull/155)) Add process dev command.

#### Changed

- ([#166](https://github.com/mesg-foundation/cli/pull/166)) Update account:import command to match the new inputs of import task of ethwallet.

#### Fixed

- ([#165](https://github.com/mesg-foundation/cli/pull/165)) Fix issue with zero data on the `service:execute` command.

## [v1.3.2](https://github.com/mesg-foundation/cli/releases/tag/v1.3.2)

#### Changed

- ([#159](https://github.com/mesg-foundation/cli/pull/159)) Use latest version of the engine v0.14.2.

## [v1.3.1](https://github.com/mesg-foundation/cli/releases/tag/v1.3.1)

#### Changed

- ([#152](https://github.com/mesg-foundation/cli/pull/152)) Use latest version of the engine v0.14.1 and mesg-js v4.3.1.

## [v1.3.0](https://github.com/mesg-foundation/cli/releases/tag/v1.3.0)

#### Added

- ([#125](https://github.com/mesg-foundation/cli/pull/125)) Add service resolution for process compilation. ([#129](https://github.com/mesg-foundation/cli/pull/129)).
- ([#126](https://github.com/mesg-foundation/cli/pull/126)) Add commands to interact with processes (create, delete, detail, list).
- ([#130](https://github.com/mesg-foundation/cli/pull/130)) Add the flag `--port` and `--host` to override the default address of the engine.
- ([#142](https://github.com/mesg-foundation/cli/pull/142)) Process compilation. ([#123](https://github.com/mesg-foundation/cli/pull/123)). ([#149](https://github.com/mesg-foundation/cli/pull/149)).
- ([#143](https://github.com/mesg-foundation/cli/pull/143)) Support env variable injection in processes. ([#150](https://github.com/mesg-foundation/cli/pull/150)).

#### Changed

- ([#131](https://github.com/mesg-foundation/cli/pull/131)) Better error management for services start and create. ([#132](https://github.com/mesg-foundation/cli/pull/132)). ([#135](https://github.com/mesg-foundation/cli/pull/135)).

#### Fixed

- ([#134](https://github.com/mesg-foundation/cli/pull/134)) Fix command service:dev when a service or instance already exists. ([#136](https://github.com/mesg-foundation/cli/pull/136)).
- ([#138](https://github.com/mesg-foundation/cli/pull/138)) Encode and decode hashes from and to base58. ([#144](https://github.com/mesg-foundation/cli/pull/144)). ([#148](https://github.com/mesg-foundation/cli/pull/148)).
- ([#141](https://github.com/mesg-foundation/cli/pull/141)) Fix issue when a service is created with no configuration.

## [v1.2.0](https://github.com/mesg-foundation/cli/releases/tag/v1.2.0)

#### Added

- ([#117](https://github.com/mesg-foundation/cli/pull/117)) Add `--start` flag to the `service:create` command to automatically start the service when created.
- ([#118](https://github.com/mesg-foundation/cli/pull/118)) Limit size of the upload during compilation to avoid mistakes (limit to 10MB).
- ([#120](https://github.com/mesg-foundation/cli/pull/120)) Use latest MESG engine v0.12.

#### Changed

- ([#114](https://github.com/mesg-foundation/cli/pull/114)) Update compilation strategy.
- ([#119](https://github.com/mesg-foundation/cli/pull/119)) Migrate to mesg-js 4.2.

#### Fixed

- ([#38](https://github.com/mesg-foundation/cli/issues/38)) Fix issue when deploying from a wrong directory.
- ([#116](https://github.com/mesg-foundation/cli/pull/116)) Fix `service:logs` with the last version of the engine.
- ([#121](https://github.com/mesg-foundation/cli/pull/121)) Fix issue when running `service:list` command with no instances running.

#### Experimental

- ([#115](https://github.com/mesg-foundation/cli/pull/115)) Add workflow compilation.

## [v1.1.0](https://github.com/mesg-foundation/cli/releases/tag/v1.1.0)

### [Click here to see the release notes](https://forum.mesg.com/t/release-notes-of-engine-v0-11-cli-v1-1-and-js-library-v4/339)

#### Added

- ([#99](https://github.com/mesg-foundation/cli/pull/99)) Sid support.
- ([#106](https://github.com/mesg-foundation/cli/pull/106)) Add service and instance resolvers.

#### Changed

- ([#81](https://github.com/mesg-foundation/cli/pull/81)) Integration of the new Engine v0.11 APIs.
- ([#87](https://github.com/mesg-foundation/cli/pull/87)) Revert name from service:get to service:detail.
- ([#90](https://github.com/mesg-foundation/cli/pull/90)) capitalize all flag descriptions.
- ([#91](https://github.com/mesg-foundation/cli/pull/91)) display ... for multiple args.
- ([#92](https://github.com/mesg-foundation/cli/pull/92)) add description quiet flag and make silent hidden.
- ([#93](https://github.com/mesg-foundation/cli/pull/93)) Switch to v0.11.0 of the Engine.

#### Fixed

- ([#84](https://github.com/mesg-foundation/cli/pull/84)) Fix issue with flags on the account:* commands.
- ([#85](https://github.com/mesg-foundation/cli/pull/85)) Better management of confirm flag with delete data only.
- ([#86](https://github.com/mesg-foundation/cli/pull/86)) Fix marketplace commands.
- ([#88](https://github.com/mesg-foundation/cli/pull/88)) fix flags with marketplace:publish command.
- ([#97](https://github.com/mesg-foundation/cli/pull/97)) Fix command service:logs by removing wrong flag passed to ServiceStop.
- ([#98](https://github.com/mesg-foundation/cli/pull/98)) Better service:dev exit.
- ([#100](https://github.com/mesg-foundation/cli/pull/100)) Improve ux of account commands.
- ([#101](https://github.com/mesg-foundation/cli/pull/101)) Improve text of commands daemon.
- ([#102](https://github.com/mesg-foundation/cli/pull/102)) dependOn is breaking release.
- ([#103](https://github.com/mesg-foundation/cli/pull/103)) Improve commands marketplace.
- ([#104](https://github.com/mesg-foundation/cli/pull/104)) Improve command roots.
- ([#105](https://github.com/mesg-foundation/cli/pull/105)) Improve us of service command.
- ([#107](https://github.com/mesg-foundation/cli/pull/107)) Only display the error's message.

#### Removed

- ([#89](https://github.com/mesg-foundation/cli/pull/89)) remove aliases.

## [v1.0.0](https://github.com/mesg-foundation/cli/releases/tag/v1.0.0)

### [Click here to see the release notes](https://forum.mesg.com/t/mesg-engine-v0-10-js-cli-and-js-library-v3-0-0-release-notes/317)
- Initial version of the new CLI.
