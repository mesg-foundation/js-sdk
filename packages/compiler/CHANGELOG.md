# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcompiler%40X.X.X)

#### Breaking Changes
#### Improvements
#### Bug fixes

## [v0.1.0](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcompiler%400.1.0)

#### Improvements

- Add support of path for the process map references. You can now reference not only the root variable of a result/event but also any nested data.
In order to reference a nested data you can use a simplified json path format where `.` let you access a nested data and `[]` let you access an index of an array.
Examples:
  - `foo.bar`: Access the variable `bar` in the object `foo`.
  - `foo[0]`: Access the first element of the array `foo`.
  - `foo[0].bar[1]`: Access the second element of the array `bar` contained in the first element of the array `foo`.
  - `foo[0][1]`: Access the second element in the first element of the array `foo`.

Updated the `files` section in `package.json` with `lib` and `npm-shrinkwrap.json`
