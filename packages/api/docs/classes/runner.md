[@mesg/api](../README.md) › [Globals](../globals.md) › [Runner](runner.md)

# Class: Runner

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Runner**

## Index

### Constructors

* [constructor](runner.md#constructor)

### Methods

* [createMsg](runner.md#createmsg)
* [deleteMsg](runner.md#deletemsg)
* [get](runner.md#get)
* [hash](runner.md#hash)
* [list](runner.md#list)

## Constructors

###  constructor

\+ **new Runner**(`endpoint`: string): *[Runner](runner.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Runner](runner.md)*

## Methods

###  createMsg

▸ **createMsg**(`owner`: string, `serviceHash`: string, `envHash`: string): *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

*Defined in [runner.ts:24](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L24)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`serviceHash` | string |
`envHash` | string |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

___

###  deleteMsg

▸ **deleteMsg**(`owner`: string, `hash`: string): *[IMsg](../globals.md#imsg)‹[IMsgDelete](../globals.md#imsgdelete)›*

*Defined in [runner.ts:35](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L35)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`hash` | string |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgDelete](../globals.md#imsgdelete)›*

___

###  get

▸ **get**(`hash`: string): *Promise‹[IRunner](../globals.md#irunner)›*

*Defined in [runner.ts:45](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L45)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IRunner](../globals.md#irunner)›*

___

###  hash

▸ **hash**(`owner`: string, `serviceHash`: string, `env`: string[]): *Promise‹object›*

*Defined in [runner.ts:56](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L56)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`serviceHash` | string |
`env` | string[] |

**Returns:** *Promise‹object›*

___

###  list

▸ **list**(`filter?`: object): *Promise‹[IRunner](../globals.md#irunner)[]›*

*Defined in [runner.ts:49](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L49)*

**Parameters:**

▪`Optional`  **filter**: *object*

Name | Type |
------ | ------ |
`address?` | string &#124; null |
`instanceHash?` | string &#124; null |

**Returns:** *Promise‹[IRunner](../globals.md#irunner)[]›*
