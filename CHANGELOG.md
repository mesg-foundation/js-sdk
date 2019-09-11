# Changelog

## [Unreleased](https://github.com/mesg-foundation/cli/compare/master...dev)

#### Breaking Changes
#### Added
#### Changed
#### Fixed
#### Removed

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
