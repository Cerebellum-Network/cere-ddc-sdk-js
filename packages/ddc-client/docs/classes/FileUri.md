[@cere-ddc-sdk/ddc-client](../README.md) / FileUri

# Class: FileUri

Represents a URI for a file in DDC.

A FileUri extends the DdcUri class with the entity type set to 'file'.

## Hierarchy

- [`DdcUri`](DdcUri.md)\<``"file"``\>

  ↳ **`FileUri`**

## Properties

### bucketId

• `Readonly` **bucketId**: `bigint`

The bucket identifier.

#### Inherited from

[DdcUri](DdcUri.md).[bucketId](DdcUri.md#bucketid)

___

### cid

• `Readonly` **cid**: `string` = `''`

The Content Identifier (CID) of the entity.

#### Inherited from

[DdcUri](DdcUri.md).[cid](DdcUri.md#cid)

___

### entity

• `Readonly` **entity**: ``"file"``

The type of the entity.

#### Inherited from

[DdcUri](DdcUri.md).[entity](DdcUri.md#entity)

___

### name

• `Optional` `Readonly` **name**: `string`

The name of the entity.

#### Inherited from

[DdcUri](DdcUri.md).[name](DdcUri.md#name)

## Accessors

### cidOrName

• `get` **cidOrName**(): `string`

The CID or name of the entity.

#### Returns

`string`

#### Inherited from

DdcUri.cidOrName
