[@mesg/api](README.md) › [Globals](globals.md)

# @mesg/api

## Index

### Enumerations

* [FilterPredicate](enums/filterpredicate.md)
* [Resource](enums/resource.md)
* [Status](enums/status.md)

### Classes

* [API](classes/api.md)
* [Account](classes/account.md)
* [Execution](classes/execution.md)
* [Instance](classes/instance.md)
* [LCDClient](classes/lcdclient.md)
* [Ownership](classes/ownership.md)
* [Process](classes/process.md)
* [Runner](classes/runner.md)
* [Service](classes/service.md)
* [Transaction](classes/transaction.md)

### Type aliases

* [Event](globals.md#event)
* [IAccount](globals.md#iaccount)
* [ICoin](globals.md#icoin)
* [IConfiguration](globals.md#iconfiguration)
* [IDecCoin](globals.md#ideccoin)
* [IDefinition](globals.md#idefinition)
* [IDependency](globals.md#idependency)
* [IEdge](globals.md#iedge)
* [IEvent](globals.md#ievent)
* [IEventType](globals.md#ieventtype)
* [IExecution](globals.md#iexecution)
* [IFee](globals.md#ifee)
* [IFilter](globals.md#ifilter)
* [IFilterCondition](globals.md#ifiltercondition)
* [IFilterType](globals.md#ifiltertype)
* [IFilterValueBoolType](globals.md#ifiltervaluebooltype)
* [IFilterValueNullType](globals.md#ifiltervaluenulltype)
* [IFilterValueNumberType](globals.md#ifiltervaluenumbertype)
* [IFilterValueStringType](globals.md#ifiltervaluestringtype)
* [IInstance](globals.md#iinstance)
* [IMapOutput](globals.md#imapoutput)
* [IMapType](globals.md#imaptype)
* [IMsg](globals.md#imsg)
* [IMsgCreate](globals.md#imsgcreate)
* [IMsgDelete](globals.md#imsgdelete)
* [IMsgTransfer](globals.md#imsgtransfer)
* [INode](globals.md#inode)
* [IOutput](globals.md#ioutput)
* [IOutputBoolType](globals.md#ioutputbooltype)
* [IOutputDoubleType](globals.md#ioutputdoubletype)
* [IOutputListType](globals.md#ioutputlisttype)
* [IOutputMapType](globals.md#ioutputmaptype)
* [IOutputNullType](globals.md#ioutputnulltype)
* [IOutputStringType](globals.md#ioutputstringtype)
* [IOwnership](globals.md#iownership)
* [IParameter](globals.md#iparameter)
* [IProcess](globals.md#iprocess)
* [IRefPath](globals.md#irefpath)
* [IRefSelectorIndex](globals.md#irefselectorindex)
* [IRefSelectorKey](globals.md#irefselectorkey)
* [IReference](globals.md#ireference)
* [IResult](globals.md#iresult)
* [IResultType](globals.md#iresulttype)
* [IRunner](globals.md#irunner)
* [IService](globals.md#iservice)
* [IStdTx](globals.md#istdtx)
* [ITask](globals.md#itask)
* [ITaskType](globals.md#itasktype)
* [ITx](globals.md#itx)
* [Log](globals.md#log)
* [TxResult](globals.md#txresult)

### Variables

* [_resolutionTable](globals.md#const-_resolutiontable)
* [_resolutionTableRunners](globals.md#const-_resolutiontablerunners)
* [address](globals.md#const-address)
* [api](globals.md#const-api)
* [base](globals.md#const-base)
* [bech32Prefix](globals.md#const-bech32prefix)
* [bs58](globals.md#const-bs58)
* [defaultHDPath](globals.md#const-defaulthdpath)
* [instanceHash](globals.md#const-instancehash)
* [instances](globals.md#const-instances)
* [mnemonic](globals.md#const-mnemonic)
* [runnerHash](globals.md#const-runnerhash)
* [serviceHash](globals.md#const-servicehash)
* [services](globals.md#const-services)

### Functions

* [decode](globals.md#const-decode)
* [decodeField](globals.md#const-decodefield)
* [encode](globals.md#const-encode)
* [encodeField](globals.md#const-encodefield)
* [encodeFields](globals.md#const-encodefields)
* [findHash](globals.md#const-findhash)
* [isAction](globals.md#const-isaction)
* [isHash](globals.md#const-ishash)
* [isModule](globals.md#const-ismodule)
* [resolveSID](globals.md#const-resolvesid)
* [resolveSIDRunner](globals.md#const-resolvesidrunner)
* [sortObject](globals.md#const-sortobject)

### Object literals

* [Predicate](globals.md#const-predicate)
* [service](globals.md#const-service)

## Type aliases

###  Event

Ƭ **Event**: *object*

*Defined in [index.ts:11](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/index.ts#L11)*

#### Type declaration:

* **attributes**: *object[]*

* **type**: *string*

___

###  IAccount

Ƭ **IAccount**: *object*

*Defined in [account.ts:11](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L11)*

#### Type declaration:

* **account_number**: *number*

* **address**: *string*

* **coins**: *[ICoin](globals.md#icoin)[]*

* **public_key**: *string*

* **sequence**: *number*

___

###  ICoin

Ƭ **ICoin**: *object*

*Defined in [transaction.ts:18](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L18)*

#### Type declaration:

* **amount**: *string*

* **denom**: *"atto"*

___

###  IConfiguration

Ƭ **IConfiguration**: *object*

*Defined in [service.ts:4](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L4)*

#### Type declaration:

* **args**? : *string[] | null*

* **command**? : *string | null*

* **env**? : *string[] | null*

* **ports**? : *string[] | null*

* **volumes**? : *string[] | null*

* **volumesFrom**? : *string[] | null*

___

###  IDecCoin

Ƭ **IDecCoin**: *object*

*Defined in [transaction.ts:23](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L23)*

#### Type declaration:

* **amount**: *number | string*

* **denom**: *"atto"*

___

###  IDefinition

Ƭ **IDefinition**: *object*

*Defined in [service.ts:57](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L57)*

*Defined in [process.ts:209](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L209)*

#### Type declaration:

* **edges**: *[IEdge](globals.md#iedge)[]*

* **name**: *string*

* **nodes**: *[INode](globals.md#inode)[]*

___

###  IDependency

Ƭ **IDependency**: *[IConfiguration](globals.md#iconfiguration) & object*

*Defined in [service.ts:13](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L13)*

___

###  IEdge

Ƭ **IEdge**: *object*

*Defined in [process.ts:204](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L204)*

#### Type declaration:

* **dst**: *string*

* **src**: *string*

___

###  IEvent

Ƭ **IEvent**: *object*

*Defined in [service.ts:36](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L36)*

*Defined in [process.ts:9](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L9)*

#### Type declaration:

* **eventKey**: *string*

* **instanceHash**: *string*

___

###  IEventType

Ƭ **IEventType**: *object*

*Defined in [process.ts:171](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L171)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Event_"*

* **value**(): *object*

  * **event**: *[IEvent](globals.md#ievent)*

___

###  IExecution

Ƭ **IExecution**: *object*

*Defined in [execution.ts:11](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/execution.ts#L11)*

#### Type declaration:

* **address**? : *string*

* **blockHeight**? : *number*

* **emitters**? : *object[]*

* **error**? : *string*

* **eventHash**? : *string*

* **executorHash**: *string*

* **hash**: *string*

* **inputs**? : *any*

* **instanceHash**: *string*

* **nodeKey**? : *string*

* **outputs**? : *any*

* **parentHash**? : *string*

* **price**? : *string*

* **processHash**? : *string*

* **status**: *[Status](enums/status.md)*

* **tags**? : *Array*

* **taskKey**: *string*

___

###  IFee

Ƭ **IFee**: *object*

*Defined in [transaction.ts:28](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L28)*

#### Type declaration:

* **amount**: *[ICoin](globals.md#icoin)[]*

* **gas**: *number | string*

___

###  IFilter

Ƭ **IFilter**: *object*

*Defined in [process.ts:160](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L160)*

#### Type declaration:

* **conditions**: *[IFilterCondition](globals.md#ifiltercondition)[]*

___

###  IFilterCondition

Ƭ **IFilterCondition**: *object*

*Defined in [process.ts:149](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L149)*

#### Type declaration:

* **predicate**: *[FilterPredicate](enums/filterpredicate.md)*

* **ref**(): *object*

  * **nodeKey**: *string*

  * **path**: *[IRefPath](globals.md#irefpath)*

* **value**(): *object*

  * **Kind**: *[IFilterValueNullType](globals.md#ifiltervaluenulltype) | [IFilterValueStringType](globals.md#ifiltervaluestringtype) | [IFilterValueNumberType](globals.md#ifiltervaluenumbertype) | [IFilterValueBoolType](globals.md#ifiltervaluebooltype)*

___

###  IFilterType

Ƭ **IFilterType**: *object*

*Defined in [process.ts:192](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L192)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Filter_"*

* **value**(): *object*

  * **filter**: *[IFilter](globals.md#ifilter)*

___

###  IFilterValueBoolType

Ƭ **IFilterValueBoolType**: *object*

*Defined in [process.ts:141](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L141)*

#### Type declaration:

* **type**: *"mesg.types.Value_BoolValue"*

* **value**(): *object*

  * **bool_value**: *boolean*

___

###  IFilterValueNullType

Ƭ **IFilterValueNullType**: *object*

*Defined in [process.ts:120](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L120)*

#### Type declaration:

* **type**: *"mesg.types.Value_NullValue"*

* **value**(): *object*

  * **null**? : *0*

___

###  IFilterValueNumberType

Ƭ **IFilterValueNumberType**: *object*

*Defined in [process.ts:134](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L134)*

#### Type declaration:

* **type**: *"mesg.types.Value_NumberValue"*

* **value**(): *object*

  * **number_value**: *number*

___

###  IFilterValueStringType

Ƭ **IFilterValueStringType**: *object*

*Defined in [process.ts:127](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L127)*

#### Type declaration:

* **type**: *"mesg.types.Value_StringValue"*

* **value**(): *object*

  * **string_value**: *string*

___

###  IInstance

Ƭ **IInstance**: *object*

*Defined in [instance.ts:3](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/instance.ts#L3)*

#### Type declaration:

* **envHash**: *string*

* **hash**: *string*

* **serviceHash**: *string*

___

###  IMapOutput

Ƭ **IMapOutput**: *object*

*Defined in [process.ts:96](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L96)*

#### Type declaration:

* **Key**: *string*

* **Value**: *[IOutput](globals.md#ioutput)*

___

###  IMapType

Ƭ **IMapType**: *object*

*Defined in [process.ts:185](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L185)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_"*

* **value**(): *object*

  * **map**: *[IMapOutput](globals.md#imapoutput)[]*

___

###  IMsg

Ƭ **IMsg**: *object*

*Defined in [transaction.ts:13](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L13)*

#### Type declaration:

* **type**: *string*

* **value**: *T*

___

###  IMsgCreate

Ƭ **IMsgCreate**: *object*

*Defined in [service.ts:69](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L69)*

*Defined in [runner.ts:11](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L11)*

*Defined in [process.ts:220](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L220)*

#### Type declaration:

* **edges**: *[IEdge](globals.md#iedge)[]*

* **name**: *string*

* **nodes**: *[INode](globals.md#inode)[]*

* **owner**: *string*

___

###  IMsgDelete

Ƭ **IMsgDelete**: *object*

*Defined in [runner.ts:17](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L17)*

*Defined in [process.ts:227](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L227)*

#### Type declaration:

* **hash**: *string*

* **owner**: *string*

___

###  IMsgTransfer

Ƭ **IMsgTransfer**: *object*

*Defined in [account.ts:19](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L19)*

#### Type declaration:

* **amount**: *[ICoin](globals.md#icoin)[]*

* **from_address**: *string*

* **to_address**: *string*

___

###  INode

Ƭ **INode**: *object*

*Defined in [process.ts:199](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L199)*

#### Type declaration:

* **Type**: *[IEventType](globals.md#ieventtype) | [IResultType](globals.md#iresulttype) | [ITaskType](globals.md#itasktype) | [IMapType](globals.md#imaptype) | [IFilterType](globals.md#ifiltertype)*

* **key**: *string*

___

###  IOutput

Ƭ **IOutput**: *object*

*Defined in [process.ts:92](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L92)*

#### Type declaration:

* **Value**: *[IOutputNullType](globals.md#ioutputnulltype) | [IOutputStringType](globals.md#ioutputstringtype) | [IOutputDoubleType](globals.md#ioutputdoubletype) | [IOutputBoolType](globals.md#ioutputbooltype) | [IOutputListType](globals.md#ioutputlisttype) | [IOutputMapType](globals.md#ioutputmaptype) | [IReference](globals.md#ireference)*

___

###  IOutputBoolType

Ƭ **IOutputBoolType**: *object*

*Defined in [process.ts:40](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L40)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_BoolConst"*

* **value**(): *object*

  * **bool_const**: *boolean*

___

###  IOutputDoubleType

Ƭ **IOutputDoubleType**: *object*

*Defined in [process.ts:33](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L33)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_DoubleConst"*

* **value**(): *object*

  * **double_const**: *number*

___

###  IOutputListType

Ƭ **IOutputListType**: *object*

*Defined in [process.ts:47](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L47)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_List_"*

* **value**(): *object*

  * **list**(): *object*

    * **outputs**: *[IOutput](globals.md#ioutput)[]*

___

###  IOutputMapType

Ƭ **IOutputMapType**: *object*

*Defined in [process.ts:56](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L56)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_Map_"*

* **value**(): *object*

  * **map**: *[IMapOutput](globals.md#imapoutput)[]*

___

###  IOutputNullType

Ƭ **IOutputNullType**: *object*

*Defined in [process.ts:19](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L19)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_Null_"*

* **value**(): *object*

  * **null**? : *0*

___

###  IOutputStringType

Ƭ **IOutputStringType**: *object*

*Defined in [process.ts:26](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L26)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Map_Output_StringConst"*

* **value**(): *object*

  * **string_const**: *string*

___

###  IOwnership

Ƭ **IOwnership**: *object*

*Defined in [ownership.ts:10](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/ownership.ts#L10)*

#### Type declaration:

* **hash**: *string*

* **owner**: *string*

* **resource**: *[Resource](enums/resource.md)*

* **resourceAddress**: *string*

* **resourceHash**: *string*

___

###  IParameter

Ƭ **IParameter**: *object*

*Defined in [service.ts:18](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L18)*

#### Type declaration:

* **description**? : *string | null*

* **key**: *string*

* **name**? : *string | null*

* **object**? : *[IParameter](globals.md#iparameter)[] | null*

* **optional**? : *boolean | null*

* **repeated**? : *boolean | null*

* **type**: *"String" | "Number" | "Boolean" | "Object" | "Any"*

___

###  IProcess

Ƭ **IProcess**: *[IDefinition](globals.md#idefinition) & object*

*Defined in [process.ts:215](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L215)*

___

###  IRefPath

Ƭ **IRefPath**: *object*

*Defined in [process.ts:77](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L77)*

#### Type declaration:

* **Selector**: *[IRefSelectorKey](globals.md#irefselectorkey) | [IRefSelectorIndex](globals.md#irefselectorindex)*

* **path**? : *[IRefPath](globals.md#irefpath)*

___

###  IRefSelectorIndex

Ƭ **IRefSelectorIndex**: *object*

*Defined in [process.ts:70](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L70)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Reference_Path_Index"*

* **value**(): *object*

  * **index**? : *string*

___

###  IRefSelectorKey

Ƭ **IRefSelectorKey**: *object*

*Defined in [process.ts:63](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L63)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Reference_Path_Key"*

* **value**(): *object*

  * **key**: *string*

___

###  IReference

Ƭ **IReference**: *object*

*Defined in [process.ts:82](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L82)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Reference"*

* **value**(): *object*

  * **ref**(): *object*

    * **nodeKey**: *string*

    * **path**: *[IRefPath](globals.md#irefpath)*

___

###  IResult

Ƭ **IResult**: *object*

*Defined in [process.ts:4](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L4)*

#### Type declaration:

* **instanceHash**: *string*

* **taskKey**: *string*

___

###  IResultType

Ƭ **IResultType**: *object*

*Defined in [process.ts:164](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L164)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Result_"*

* **value**(): *object*

  * **result**: *[IResult](globals.md#iresult)*

___

###  IRunner

Ƭ **IRunner**: *object*

*Defined in [runner.ts:4](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/runner.ts#L4)*

#### Type declaration:

* **address**: *string | null*

* **hash**: *string*

* **instanceHash**: *string | null*

* **owner**: *string*

___

###  IService

Ƭ **IService**: *object*

*Defined in [service.ts:43](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L43)*

#### Type declaration:

* **address**? : *string | null*

* **configuration**: *[IConfiguration](globals.md#iconfiguration)*

* **dependencies**? : *[IDependency](globals.md#idependency)[]*

* **description**? : *string | null*

* **events**? : *[IEvent](globals.md#ievent)[] | null*

* **hash**? : *string*

* **name**? : *string | null*

* **repository**? : *string | null*

* **sid**? : *string | null*

* **source**? : *string | null*

* **tasks**? : *[ITask](globals.md#itask)[] | null*

___

###  IStdTx

Ƭ **IStdTx**: *object*

*Defined in [transaction.ts:33](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L33)*

#### Type declaration:

* **account_number**: *string*

* **chain_id**: *string*

* **fee**: *[IFee](globals.md#ifee)*

* **memo**: *string*

* **msgs**: *[IMsg](globals.md#imsg)‹any›[]*

* **sequence**: *string*

___

###  ITask

Ƭ **ITask**: *object*

*Defined in [service.ts:28](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/service.ts#L28)*

*Defined in [process.ts:14](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L14)*

#### Type declaration:

* **instanceHash**: *string*

* **taskKey**: *string*

___

###  ITaskType

Ƭ **ITaskType**: *object*

*Defined in [process.ts:178](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L178)*

#### Type declaration:

* **type**: *"mesg.types.Process_Node_Task_"*

* **value**(): *object*

  * **task**: *[ITask](globals.md#itask)*

___

###  ITx

Ƭ **ITx**: *object*

*Defined in [transaction.ts:6](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/transaction.ts#L6)*

#### Type declaration:

* **fee**: *any*

* **memo**: *string*

* **msg**: *any[]*

* **signatures**: *any[]*

___

###  Log

Ƭ **Log**: *object*

*Defined in [index.ts:19](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/index.ts#L19)*

#### Type declaration:

* **events**: *[Event](globals.md#event)[]*

* **log**: *string*

* **msg_index**: *number*

___

###  TxResult

Ƭ **TxResult**: *object*

*Defined in [index.ts:25](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/index.ts#L25)*

#### Type declaration:

* **code**? : *number*

* **codespace**? : *string*

* **data**? : *string*

* **gas_used**: *string*

* **gas_wanted**: *string*

* **height**: *string*

* **logs**? : *[Log](globals.md#log)[]*

* **raw_log**: *string*

* **txhash**: *string*

## Variables

### `Const` _resolutionTable

• **_resolutionTable**: *Map‹string, string›* = new Map()

*Defined in [util/resolve.ts:3](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve.ts#L3)*

___

### `Const` _resolutionTableRunners

• **_resolutionTableRunners**: *Map‹string, string›* = new Map()

*Defined in [util/resolve.ts:27](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve.ts#L27)*

___

### `Const` address

• **address**: *"mesgtest19k9xsdy42f4a7f7777wj4rs5eh9622h2z7mzdh"* = "mesgtest19k9xsdy42f4a7f7777wj4rs5eh9622h2z7mzdh"

*Defined in [integration.test.ts:8](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L8)*

___

### `Const` api

• **api**: *[API](classes/api.md)‹›* = new API('http://localhost:1317')

*Defined in [integration.test.ts:7](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L7)*

___

### `Const` base

• **base**: *any* = require('base-x')

*Defined in [util/base58.ts:1](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/base58.ts#L1)*

___

### `Const` bech32Prefix

• **bech32Prefix**: *"mesgtest"* = "mesgtest"

*Defined in [account.ts:8](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L8)*

___

### `Const` bs58

• **bs58**: *any* = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')

*Defined in [util/base58.ts:2](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/base58.ts#L2)*

___

### `Const` defaultHDPath

• **defaultHDPath**: *"m/44'/470'/0'/0/0"* = "m/44'/470'/0'/0/0"

*Defined in [account.ts:9](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/account.ts#L9)*

___

### `Const` instanceHash

• **instanceHash**: *"9dq5UXSe1YBmB46c3Fs1YfQS49tyzew27qpYGGzFsQX8"* = "9dq5UXSe1YBmB46c3Fs1YfQS49tyzew27qpYGGzFsQX8"

*Defined in [integration.test.ts:28](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L28)*

___

### `Const` instances

• **instances**: *[IInstance](globals.md#iinstance)[]* = [{ hash: 'instancehash', serviceHash: 'servicehash', envHash: '' }]

*Defined in [util/resolve_test.ts:9](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve_test.ts#L9)*

___

### `Const` mnemonic

• **mnemonic**: *"afford problem shove post clump space govern reward fringe input owner knock toddler orange castle course pepper fox youth field ritual wife weapon desert"* = "afford problem shove post clump space govern reward fringe input owner knock toddler orange castle course pepper fox youth field ritual wife weapon desert"

*Defined in [integration.test.ts:9](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L9)*

___

### `Const` runnerHash

• **runnerHash**: *"J58btTi41BJ6gjFyap9w1eRZnpTrf165vDQfpdiwPpXo"* = "J58btTi41BJ6gjFyap9w1eRZnpTrf165vDQfpdiwPpXo"

*Defined in [integration.test.ts:27](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L27)*

___

### `Const` serviceHash

• **serviceHash**: *"8K1X1rfEL1WCwpm2zBwsWH3bijyNuYWTN3LKoBP4Bkfy"* = "8K1X1rfEL1WCwpm2zBwsWH3bijyNuYWTN3LKoBP4Bkfy"

*Defined in [integration.test.ts:26](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L26)*

___

### `Const` services

• **services**: *[IService](globals.md#iservice)[]* = [{ hash: 'servicehash', sid: 'servicesid', configuration: {} }]

*Defined in [util/resolve_test.ts:10](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve_test.ts#L10)*

## Functions

### `Const` decode

▸ **decode**(`data`: any): *object*

*Defined in [util/encoder.ts:59](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/encoder.ts#L59)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | any |

**Returns:** *object*

* \[ **key**: *string*\]: any

___

### `Const` decodeField

▸ **decodeField**(`field`: any): *any*

*Defined in [util/encoder.ts:40](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/encoder.ts#L40)*

**Parameters:**

Name | Type |
------ | ------ |
`field` | any |

**Returns:** *any*

___

### `Const` encode

▸ **encode**(`value`: Uint8Array): *string*

*Defined in [util/base58.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/base58.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | Uint8Array |

**Returns:** *string*

▸ **encode**(`data`: object): *any*

*Defined in [util/encoder.ts:34](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/encoder.ts#L34)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | object |

**Returns:** *any*

___

### `Const` encodeField

▸ **encodeField**(`value`: any): *object | object | object | object | object | object*

*Defined in [util/encoder.ts:1](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/encoder.ts#L1)*

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *object | object | object | object | object | object*

___

### `Const` encodeFields

▸ **encodeFields**(`data`: any): *object*

*Defined in [util/encoder.ts:29](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/encoder.ts#L29)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | any |

**Returns:** *object*

* \[ **k**: *string*\]: any

___

### `Const` findHash

▸ **findHash**(`txResult`: [TxResult](globals.md#txresult), `resourceType`: "Service" | "Process" | "Runner"): *string[]*

*Defined in [util/txevent.ts:7](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/txevent.ts#L7)*

**Parameters:**

Name | Type |
------ | ------ |
`txResult` | [TxResult](globals.md#txresult) |
`resourceType` | "Service" &#124; "Process" &#124; "Runner" |

**Returns:** *string[]*

___

### `Const` isAction

▸ **isAction**(`action`: string): *(Anonymous function)*

*Defined in [util/txevent.ts:3](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/txevent.ts#L3)*

**Parameters:**

Name | Type |
------ | ------ |
`action` | string |

**Returns:** *(Anonymous function)*

___

### `Const` isHash

▸ **isHash**(`x`: any): *boolean*

*Defined in [util/txevent.ts:5](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/txevent.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`x` | any |

**Returns:** *boolean*

___

### `Const` isModule

▸ **isModule**(`module`: string): *(Anonymous function)*

*Defined in [util/txevent.ts:4](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/txevent.ts#L4)*

**Parameters:**

Name | Type |
------ | ------ |
`module` | string |

**Returns:** *(Anonymous function)*

___

### `Const` resolveSID

▸ **resolveSID**(`api`: [API](classes/api.md), `sid`: string): *Promise‹string›*

*Defined in [util/resolve.ts:8](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve.ts#L8)*

**Parameters:**

Name | Type |
------ | ------ |
`api` | [API](classes/api.md) |
`sid` | string |

**Returns:** *Promise‹string›*

___

### `Const` resolveSIDRunner

▸ **resolveSIDRunner**(`api`: [API](classes/api.md), `sid`: string): *Promise‹string›*

*Defined in [util/resolve.ts:31](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/resolve.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`api` | [API](classes/api.md) |
`sid` | string |

**Returns:** *Promise‹string›*

___

### `Const` sortObject

▸ **sortObject**(`obj`: any): *any*

*Defined in [util/sort-object.ts:1](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/util/sort-object.ts#L1)*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | any |

**Returns:** *any*

## Object literals

### `Const` Predicate

### ▪ **Predicate**: *object*

*Defined in [process.ts:111](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L111)*

###  CONTAINS

• **CONTAINS**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.CONTAINS

*Defined in [process.ts:117](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L117)*

###  EQ

• **EQ**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.EQ

*Defined in [process.ts:112](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L112)*

###  GT

• **GT**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.GT

*Defined in [process.ts:113](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L113)*

###  GTE

• **GTE**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.GTE

*Defined in [process.ts:114](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L114)*

###  LT

• **LT**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.LT

*Defined in [process.ts:115](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L115)*

###  LTE

• **LTE**: *[FilterPredicate](enums/filterpredicate.md)* = FilterPredicate.LTE

*Defined in [process.ts:116](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/process.ts#L116)*

___

### `Const` service

### ▪ **service**: *object*

*Defined in [integration.test.ts:10](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L10)*

###  configuration

• **configuration**: *object*

*Defined in [integration.test.ts:13](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L13)*

#### Type declaration:

###  name

• **name**: *string* = "js-function"

*Defined in [integration.test.ts:12](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L12)*

###  sid

• **sid**: *string* = "js-function"

*Defined in [integration.test.ts:11](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L11)*

###  source

• **source**: *string* = "QmV9uGGMPcaF22TjBJEcko6VxjJpK3wdtaypHEbh6j4Pz9"

*Defined in [integration.test.ts:24](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L24)*

###  tasks

• **tasks**: *object[]* = [{
    key: "execute",
    inputs: [
      { key: "code", type: "String" },
      { key: "inputs", type: "Any" }
    ],
    outputs: [
      { key: "result", type: "Any" }
    ]
  }]

*Defined in [integration.test.ts:14](https://github.com/mesg-foundation/js-sdk/blob/6f7dc6f/packages/api/src/integration.test.ts#L14)*
