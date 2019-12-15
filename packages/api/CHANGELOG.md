# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/vX.X.X)

#### Breaking Changes

- The key in the process's nodes had been moved from the node resource to the root of the node. 
- `CreateProcessRequest` now accepts a `name` instead of a `key`.
- `Execution` contains a `nodeKey` instead of `stepID`
- Ownership now contains the `resourceHash` and a `resource` that can be `Service (1)` or `Process (2)`. `serviceHash` attribute has been removed
- Remove `account` API

#### Added

- Add proto validation information

#### Changed
#### Fixed
#### Removed

This library has been moved from https://github.com/mesg-foundation/mesg-js, please check https://github.com/mesg-foundation/mesg-js/blob/master/CHANGELOG.md for previous updates