[@mesg/api](../README.md) › [Globals](../globals.md) › [Ownership](ownership.md)

# Class: Ownership

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Ownership**

## Index

### Constructors

* [constructor](ownership.md#constructor)

### Methods

* [list](ownership.md#list)

## Constructors

###  constructor

\+ **new Ownership**(`endpoint`: string): *[Ownership](ownership.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Ownership](ownership.md)*

## Methods

###  list

▸ **list**(): *Promise‹[IOwnership](../globals.md#iownership)[]›*

*Defined in [ownership.ts:20](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/ownership.ts#L20)*

**Returns:** *Promise‹[IOwnership](../globals.md#iownership)[]›*
