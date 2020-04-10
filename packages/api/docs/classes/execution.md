[@mesg/api](../README.md) › [Globals](../globals.md) › [Execution](execution.md)

# Class: Execution

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Execution**

## Index

### Constructors

* [constructor](execution.md#constructor)

### Methods

* [get](execution.md#get)
* [list](execution.md#list)

## Constructors

###  constructor

\+ **new Execution**(`endpoint`: string): *[Execution](execution.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [src/util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Execution](execution.md)*

## Methods

###  get

▸ **get**(`hash`: string): *Promise‹[IExecution](../globals.md#iexecution)›*

*Defined in [src/execution.ts:37](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/execution.ts#L37)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IExecution](../globals.md#iexecution)›*

___

###  list

▸ **list**(): *Promise‹[IExecution](../globals.md#iexecution)[]›*

*Defined in [src/execution.ts:41](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/execution.ts#L41)*

**Returns:** *Promise‹[IExecution](../globals.md#iexecution)[]›*
