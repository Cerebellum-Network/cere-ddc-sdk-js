[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / FileUri

# Class: FileUri

Represents a URI for a file in DDC.

A FileUri extends the DdcUri class with the entity type set to 'file'.

## Extends

- [`DdcUri`](DdcUri.md)\<`"file"`\>

## Properties

### bucketId

> `readonly` **bucketId**: `bigint`

The bucket identifier.

#### Inherited from

[`DdcUri`](DdcUri.md).[`bucketId`](DdcUri.md#bucketid)

***

### cid

> `readonly` **cid**: `string` = `''`

The Content Identifier (CID) of the entity.

#### Inherited from

[`DdcUri`](DdcUri.md).[`cid`](DdcUri.md#cid)

***

### entity

> `readonly` **entity**: `"file"`

The type of the entity.

#### Inherited from

[`DdcUri`](DdcUri.md).[`entity`](DdcUri.md#entity)

***

### name?

> `readonly` `optional` **name?**: `string`

The name of the entity.

#### Inherited from

[`DdcUri`](DdcUri.md).[`name`](DdcUri.md#name)

## Accessors

### cidOrName

#### Get Signature

> **get** **cidOrName**(): `string`

The CID or name of the entity.

##### Returns

`string`

#### Inherited from

[`DdcUri`](DdcUri.md).[`cidOrName`](DdcUri.md#cidorname)
