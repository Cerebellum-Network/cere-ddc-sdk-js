[@cere-ddc-sdk/ddc-client](../README.md) / DdcUri

# Class: DdcUri\<T\>

A generic representation of a DDC URI.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends `DdcEntity` = `DdcEntity` | The type of the entity. Must extend DdcEntity. |

## Hierarchy

- **`DdcUri`**

  ↳ [`FileUri`](FileUri.md)

  ↳ [`DagNodeUri`](DagNodeUri.md)

## Properties

### bucketId

• `Readonly` **bucketId**: `bigint`

The bucket identifier.

___

### cid

• `Readonly` **cid**: `string` = `''`

The Content Identifier (CID) of the entity.

___

### entity

• `Readonly` **entity**: `T`

The type of the entity.

___

### name

• `Optional` `Readonly` **name**: `string`

The name of the entity.

## Accessors

### cidOrName

• `get` **cidOrName**(): `string`

The CID or name of the entity.

#### Returns

`string`
