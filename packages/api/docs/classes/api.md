[@mesg/api](../README.md) › [Globals](../globals.md) › [API](api.md)

# Class: API

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **API**

## Index

### Constructors

* [constructor](api.md#constructor)

### Properties

* [account](api.md#account)
* [execution](api.md#execution)
* [instance](api.md#instance)
* [ownership](api.md#ownership)
* [process](api.md#process)
* [runner](api.md#runner)
* [service](api.md#service)

### Methods

* [broadcast](api.md#broadcast)
* [createTransaction](api.md#createtransaction)

## Constructors

###  constructor

\+ **new API**(`endpoint?`: string): *[API](api.md)*

*Overrides [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [src/index.ts:44](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L44)*

**Parameters:**

Name | Type |
------ | ------ |
`endpoint?` | string |

**Returns:** *[API](api.md)*

## Properties

###  account

• **account**: *[Account](account.md)*

*Defined in [src/index.ts:44](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L44)*

___

###  execution

• **execution**: *[Execution](execution.md)*

*Defined in [src/index.ts:42](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L42)*

___

###  instance

• **instance**: *[Instance](instance.md)*

*Defined in [src/index.ts:39](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L39)*

___

###  ownership

• **ownership**: *[Ownership](ownership.md)*

*Defined in [src/index.ts:43](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L43)*

___

###  process

• **process**: *[Process](process.md)*

*Defined in [src/index.ts:41](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L41)*

___

###  runner

• **runner**: *[Runner](runner.md)*

*Defined in [src/index.ts:40](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L40)*

___

###  service

• **service**: *[Service](service.md)*

*Defined in [src/index.ts:38](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L38)*

## Methods

###  broadcast

▸ **broadcast**(`tx`: [Transaction](transaction.md), `mode`: "block" | "sync" | "async"): *Promise‹[TxResult](../globals.md#txresult)›*

*Defined in [src/index.ts:78](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L78)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`tx` | [Transaction](transaction.md) | - |
`mode` | "block" &#124; "sync" &#124; "async" | "block" |

**Returns:** *Promise‹[TxResult](../globals.md#txresult)›*

___

###  createTransaction

▸ **createTransaction**(`msgs`: [IMsg](../globals.md#imsg)‹any›[], `account`: [IAccount](../globals.md#iaccount), `opts`: object): *Promise‹[Transaction](transaction.md)‹››*

*Defined in [src/index.ts:57](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/index.ts#L57)*

**Parameters:**

▪ **msgs**: *[IMsg](../globals.md#imsg)‹any›[]*

▪ **account**: *[IAccount](../globals.md#iaccount)*

▪`Default value`  **opts**: *object*= {}

Name | Type |
------ | ------ |
`account_number?` | number |
`chain_id?` | string |
`fee?` | [IFee](../globals.md#ifee) |
`memo?` | string |
`sequence?` | number |

**Returns:** *Promise‹[Transaction](transaction.md)‹››*
