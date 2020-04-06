[@mesg/api](../README.md) › [Globals](../globals.md) › [Account](account.md)

# Class: Account

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Account**

## Index

### Constructors

* [constructor](account.md#constructor)

### Methods

* [get](account.md#get)
* [import](account.md#import)
* [transferMsg](account.md#transfermsg)
* [deriveMnemonic](account.md#static-derivemnemonic)
* [generateMnemonic](account.md#static-generatemnemonic)
* [getPrivateKey](account.md#static-getprivatekey)

## Constructors

###  constructor

\+ **new Account**(`endpoint`: string): *[Account](account.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Account](account.md)*

## Methods

###  get

▸ **get**(`address`: string): *Promise‹[IAccount](../globals.md#iaccount)›*

*Defined in [account.ts:61](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L61)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |

**Returns:** *Promise‹[IAccount](../globals.md#iaccount)›*

___

###  import

▸ **import**(`mnemonic`: string, `path?`: string, `prefix`: string): *Promise‹[IAccount](../globals.md#iaccount)›*

*Defined in [account.ts:55](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L55)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`mnemonic` | string | - |
`path?` | string | - |
`prefix` | string | bech32Prefix |

**Returns:** *Promise‹[IAccount](../globals.md#iaccount)›*

___

###  transferMsg

▸ **transferMsg**(`from`: string, `to`: string, `amount`: [ICoin](../globals.md#icoin)[]): *[IMsg](../globals.md#imsg)‹[IMsgTransfer](../globals.md#imsgtransfer)›*

*Defined in [account.ts:44](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L44)*

**Parameters:**

Name | Type |
------ | ------ |
`from` | string |
`to` | string |
`amount` | [ICoin](../globals.md#icoin)[] |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgTransfer](../globals.md#imsgtransfer)›*

___

### `Static` deriveMnemonic

▸ **deriveMnemonic**(`mnemonic`: string, `path`: string): *BIP32Interface*

*Defined in [account.ts:27](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L27)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`mnemonic` | string | - |
`path` | string | defaultHDPath |

**Returns:** *BIP32Interface*

___

### `Static` generateMnemonic

▸ **generateMnemonic**(): *string*

*Defined in [account.ts:38](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L38)*

**Returns:** *string*

___

### `Static` getPrivateKey

▸ **getPrivateKey**(`mnemonic`: string, `path?`: string): *Buffer*

*Defined in [account.ts:34](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L34)*

**Parameters:**

Name | Type |
------ | ------ |
`mnemonic` | string |
`path?` | string |

**Returns:** *Buffer*
