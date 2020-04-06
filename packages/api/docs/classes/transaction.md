[@mesg/api](../README.md) › [Globals](../globals.md) › [Transaction](transaction.md)

# Class: Transaction

## Hierarchy

* **Transaction**

## Index

### Constructors

* [constructor](transaction.md#constructor)

### Properties

* [raw](transaction.md#raw)

### Methods

* [sign](transaction.md#sign)
* [signWithMnemonic](transaction.md#signwithmnemonic)
* [sign](transaction.md#static-sign)

## Constructors

###  constructor

\+ **new Transaction**(`stdTx`: [IStdTx](../globals.md#istdtx)): *[Transaction](transaction.md)*

*Defined in [transaction.ts:53](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L53)*

**Parameters:**

Name | Type |
------ | ------ |
`stdTx` | [IStdTx](../globals.md#istdtx) |

**Returns:** *[Transaction](transaction.md)*

## Properties

###  raw

• **raw**: *[ITx](../globals.md#itx)*

*Defined in [transaction.ts:45](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L45)*

## Methods

###  sign

▸ **sign**(`ecpairPriv`: Buffer): *[Transaction](transaction.md)*

*Defined in [transaction.ts:70](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L70)*

**Parameters:**

Name | Type |
------ | ------ |
`ecpairPriv` | Buffer |

**Returns:** *[Transaction](transaction.md)*

___

###  signWithMnemonic

▸ **signWithMnemonic**(`mnemonic`: string, `path?`: string): *[Transaction](transaction.md)*

*Defined in [transaction.ts:66](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L66)*

**Parameters:**

Name | Type |
------ | ------ |
`mnemonic` | string |
`path?` | string |

**Returns:** *[Transaction](transaction.md)*

___

### `Static` sign

▸ **sign**(`message`: string, `ecpairPriv`: Buffer): *any*

*Defined in [transaction.ts:47](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`ecpairPriv` | Buffer |

**Returns:** *any*
