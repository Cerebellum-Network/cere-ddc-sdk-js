[@cere-ddc-sdk/ddc](../README.md) / CnsRecordResponse

# Class: CnsRecordResponse

The `CnsRecordResponse` class represents a response for a CNS record.

## Hierarchy

- [`CnsRecord`](CnsRecord.md)

  ↳ **`CnsRecordResponse`**

## Methods

### isCnsRecord

▸ **isCnsRecord**(`object`): object is CnsRecord

Checks if an object is an instance of `CnsRecord`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `unknown` | The object to check. |

#### Returns

object is CnsRecord

`true` if the object is an instance of `CnsRecord` or has the same properties as a `CnsRecord`, `false` otherwise.

#### Inherited from

[CnsRecord](CnsRecord.md).[isCnsRecord](CnsRecord.md#iscnsrecord)

## Properties

### cid

• `Readonly` **cid**: `string`

The content identifier (CID) of the CNS record.

#### Inherited from

[CnsRecord](CnsRecord.md).[cid](CnsRecord.md#cid)

___

### name

• `Readonly` **name**: `string`

The name of the CNS record.

#### Inherited from

[CnsRecord](CnsRecord.md).[name](CnsRecord.md#name)

___

### signature

• `Readonly` **signature**: `Signature`

The signature of the response as a `Signature` object.
