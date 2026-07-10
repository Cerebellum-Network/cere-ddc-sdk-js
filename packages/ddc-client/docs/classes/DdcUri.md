[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / DdcUri

# Class: DdcUri\<T\>

A generic representation of a DDC URI.

## Extended by

- [`FileUri`](FileUri.md)
- [`DagNodeUri`](DagNodeUri.md)

## Type Parameters

### T

`T` *extends* `DdcEntity` = `DdcEntity`

The type of the entity. Must extend DdcEntity.

## Properties

### bucketId

> `readonly` **bucketId**: `bigint`

The bucket identifier.

***

### cid

> `readonly` **cid**: `string` = `''`

The Content Identifier (CID) of the entity.

***

### entity

> `readonly` **entity**: `T`

The type of the entity.

***

### name?

> `readonly` `optional` **name?**: `string`

The name of the entity.

## Accessors

### cidOrName

#### Get Signature

> **get** **cidOrName**(): `string`

The CID or name of the entity.

##### Returns

`string`
