# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fapi%40X.X.X)

#### Breaking Changes
#### Improvements

- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Add LCD API for all reading (execution, instance, ownership, process, runner, service)
- [#179](https://github.com/mesg-foundation/js-sdk/pull/179) Migrate resolver to use LCD server
- [#183](https://github.com/mesg-foundation/js-sdk/pull/183) Add account import from a mnemonic

#### Bug fixes

## [v0.2.0](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fapi%400.2.0)

#### Breaking Changes

- [#148](https://github.com/mesg-foundation/js-sdk/pull/148) The key in the process's nodes had been moved from the node resource to the root of the node. 
  - `CreateProcessRequest` now accepts a `name` instead of a `key`.
  - `Execution` contains a `nodeKey` instead of `stepID`
- [#151](https://github.com/mesg-foundation/js-sdk/pull/151) Ownership now contains the `resourceHash` and a `resource` that can be `Service (1)` or `Process (2)`. `serviceHash` attribute has been removed
- [#152](https://github.com/mesg-foundation/js-sdk/pull/152) Remove `account` API
- [#153](https://github.com/mesg-foundation/js-sdk/pull/153) Process map reference definition has changed, `key` disappeared in favor of path (that contains a key, and index and a path) in order to access to nested data

#### Improvements

- [#148](https://github.com/mesg-foundation/js-sdk/pull/148) Add proto validation information

#### Bug fixes

- [#150](https://github.com/mesg-foundation/js-sdk/pull/150) Updated the `files` section in `package.json` with `lib` and `npm-shrinkwrap.json`

This library has been moved from https://github.com/mesg-foundation/mesg-js, please check https://github.com/mesg-foundation/mesg-js/blob/master/CHANGELOG.md for previous updates
