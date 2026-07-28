[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / DagNodeUri

# Class: DagNodeUri

Represents a URI for a DAG (Directed Acyclic Graph) node in DDC.

A DagNodeUri extends the DdcUri class with the entity type set to 'dag-node'.

## Extends

- [`DdcUri`](DdcUri.md)\<`"dag-node"`\>

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

> `readonly` **entity**: `"dag-node"`

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
