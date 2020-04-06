[@mesg/api](../README.md) › [Globals](../globals.md) › [Process](process.md)

# Class: Process

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Process**

## Index

### Constructors

* [constructor](process.md#constructor)

### Methods

* [createMsg](process.md#createmsg)
* [deleteMsg](process.md#deletemsg)
* [get](process.md#get)
* [list](process.md#list)

## Constructors

###  constructor

\+ **new Process**(`endpoint`: string): *[Process](process.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Process](process.md)*

## Methods

###  createMsg

▸ **createMsg**(`owner`: string, `definition`: [IDefinition](../globals.md#idefinition)): *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

*Defined in [process.ts:234](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L234)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`definition` | [IDefinition](../globals.md#idefinition) |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

___

###  deleteMsg

▸ **deleteMsg**(`owner`: string, `hash`: string): *[IMsg](../globals.md#imsg)‹[IMsgDelete](../globals.md#imsgdelete)›*

*Defined in [process.ts:246](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L246)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`hash` | string |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgDelete](../globals.md#imsgdelete)›*

___

###  get

▸ **get**(`hash`: string): *Promise‹[IProcess](../globals.md#iprocess)›*

*Defined in [process.ts:256](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L256)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IProcess](../globals.md#iprocess)›*

___

###  list

▸ **list**(): *Promise‹[IProcess](../globals.md#iprocess)[]›*

*Defined in [process.ts:260](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L260)*

**Returns:** *Promise‹[IProcess](../globals.md#iprocess)[]›*
