# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/vX.X.X)

#### Breaking Changes
#### Added

- Add support of path for the process map references. You can now reference not only the root variable of an result/event but also any nested data.
In order to reference a nested data you can use a json path like format where `.` let you access a nested data and `[]` let you access an index of an array.
Examples:
- `foo.bar`: Access to the variable bar in the object foo.
- `foo[0]`: Access to the first element of the foo array.
- `foo[0].bar[1]`: Access to the second element of the bar variable contained in the first element of the foo variable.
- `foo[0][1]`: Access to the second element in the first element of the foo array.

#### Changed
#### Fixed
#### Removed
