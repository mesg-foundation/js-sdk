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

*Defined in [util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Execution](execution.md)*

## Methods

###  get

▸ **get**(`hash`: string): *Promise‹[IExecution](../globals.md#iexecution)›*

*Defined in [execution.ts:36](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/execution.ts#L36)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IExecution](../globals.md#iexecution)›*

___

###  list

▸ **list**(): *Promise‹[IExecution](../globals.md#iexecution)[]›*

*Defined in [execution.ts:40](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/execution.ts#L40)*

**Returns:** *Promise‹[IExecution](../globals.md#iexecution)[]›*
