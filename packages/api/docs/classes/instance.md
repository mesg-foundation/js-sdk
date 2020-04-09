[@mesg/api](../README.md) › [Globals](../globals.md) › [Instance](instance.md)

# Class: Instance

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Instance**

## Index

### Constructors

* [constructor](instance.md#constructor)

### Methods

* [get](instance.md#get)
* [list](instance.md#list)

## Constructors

###  constructor

\+ **new Instance**(`endpoint`: string): *[Instance](instance.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [src/util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Instance](instance.md)*

## Methods

###  get

▸ **get**(`hash`: string): *Promise‹[IInstance](../globals.md#iinstance)›*

*Defined in [src/instance.ts:11](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/instance.ts#L11)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IInstance](../globals.md#iinstance)›*

___

###  list

▸ **list**(`filter?`: object): *Promise‹[IInstance](../globals.md#iinstance)[]›*

*Defined in [src/instance.ts:15](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/instance.ts#L15)*

**Parameters:**

▪`Optional`  **filter**: *object*

Name | Type |
------ | ------ |
`serviceHash?` | string |

**Returns:** *Promise‹[IInstance](../globals.md#iinstance)[]›*
