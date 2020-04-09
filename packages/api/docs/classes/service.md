[@mesg/api](../README.md) › [Globals](../globals.md) › [Service](service.md)

# Class: Service

## Hierarchy

* [LCDClient](lcdclient.md)

  ↳ **Service**

## Index

### Constructors

* [constructor](service.md#constructor)

### Methods

* [createMsg](service.md#createmsg)
* [exists](service.md#exists)
* [get](service.md#get)
* [hash](service.md#hash)
* [list](service.md#list)

## Constructors

###  constructor

\+ **new Service**(`endpoint`: string): *[Service](service.md)*

*Inherited from [LCDClient](lcdclient.md).[constructor](lcdclient.md#constructor)*

*Defined in [src/util/lcd.ts:5](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/util/lcd.ts#L5)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`endpoint` | string | "http://localhost:1317" |

**Returns:** *[Service](service.md)*

## Methods

###  createMsg

▸ **createMsg**(`owner`: string, `definition`: [IDefinition](../globals.md#idefinition)): *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

*Defined in [src/service.ts:75](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/service.ts#L75)*

**Parameters:**

Name | Type |
------ | ------ |
`owner` | string |
`definition` | [IDefinition](../globals.md#idefinition) |

**Returns:** *[IMsg](../globals.md#imsg)‹[IMsgCreate](../globals.md#imsgcreate)›*

___

###  exists

▸ **exists**(`hash`: string): *Promise‹boolean›*

*Defined in [src/service.ts:100](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/service.ts#L100)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹boolean›*

___

###  get

▸ **get**(`hash`: string): *Promise‹[IService](../globals.md#iservice)›*

*Defined in [src/service.ts:96](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/service.ts#L96)*

**Parameters:**

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** *Promise‹[IService](../globals.md#iservice)›*

___

###  hash

▸ **hash**(`definition`: [IDefinition](../globals.md#idefinition)): *Promise‹string›*

*Defined in [src/service.ts:104](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/service.ts#L104)*

**Parameters:**

Name | Type |
------ | ------ |
`definition` | [IDefinition](../globals.md#idefinition) |

**Returns:** *Promise‹string›*

___

###  list

▸ **list**(): *Promise‹[IService](../globals.md#iservice)[]›*

*Defined in [src/service.ts:108](https://github.com/mesg-foundation/js-sdk/blob/d03eddc/packages/api/src/service.ts#L108)*

**Returns:** *Promise‹[IService](../globals.md#iservice)[]›*
