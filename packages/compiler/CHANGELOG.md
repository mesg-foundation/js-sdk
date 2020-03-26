# Changelog

## [Unreleased](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcompiler%40X.X.X)

#### Breaking Changes

- [#186](https://github.com/mesg-foundation/js-sdk/pull/186) Compile process in a LCD format
- [#188](https://github.com/mesg-foundation/js-sdk/pull/188) Compile services in a LCD format

#### Improvements

- [#205](https://github.com/mesg-foundation/js-sdk/pull/205) Add support of any value for filters value (string, boolean or number)
- [#205](https://github.com/mesg-foundation/js-sdk/pull/205) Add advance filter conditions
A filter can now be defined as a list of conditions that contains a key, a predicate and a value. Previous definition of conditions with maps still works.
eg: 
```yaml
  - type: filter
    conditions:
      - key: data.foo[0].x
        predicate: EQ
        value: 2
```

#### Bug fixes

## [v0.2.0](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcompiler%400.2.0)

#### Improvements

- [#167](https://github.com/mesg-foundation/js-sdk/pull/167) Add json-schema validation for process compilation

## [v0.1.1](https://github.com/mesg-foundation/js-sdk/releases/tag/%40mesg%2Fcompiler%400.1.1)

#### Bug fixes

- [#158](https://github.com/mesg-foundation/js-sdk/pull/158) Add more tests to compile processes, ensure multi step processes
- [#165](https://github.com/mesg-foundation/js-sdk/pull/165) Fix issue with trigger > filter > task's reference

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
