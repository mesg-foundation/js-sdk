# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/vX.X.X)


#### Breaking Changes

- The key in the process's nodes had been moved from the node resource to the root of the node. 
- `CreateProcessRequest` now accepts a `name` instead of a `key`.
- `Execution` contains a `nodeKey` instead of `stepID`
- Ownership now contains the `resourceHash` and a `resource` that can be `Service (1)` or `Process (2)`. `serviceHash` attribute has been removed
- Remove `account` API

- Process map reference definition has changed, `key` disappeared in favor of path (that contains a key, and index and a path) in order to access to nested data

#### Added

- Add proto validation information

#### Changed
#### Fixed

Updated the `files` section in `package.json` with `lib` and `npm-shrinkwrap.json`

#### Removed

This library has been moved from https://github.com/mesg-foundation/mesg-js, please check https://github.com/mesg-foundation/mesg-js/blob/master/CHANGELOG.md for previous updates