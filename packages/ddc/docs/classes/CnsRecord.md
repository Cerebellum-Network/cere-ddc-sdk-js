[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / CnsRecord

# Class: CnsRecord

The `CnsRecord` class represents a CNS record.

## Example

```typescript
const cid = '...';
const name = 'example';
const record = new CnsRecord(cid, name);

console.log(CnsRecord.isCnsRecord(record)); // true
```

## Extended by

- [`CnsRecordResponse`](CnsRecordResponse.md)

## Implements

- `Omit`\<`cns.Record`, `"cid"` \| `"signature"`\>

## Methods

### isCnsRecord()

> `static` **isCnsRecord**(`object`): `object is CnsRecord`

Checks if an object is an instance of `CnsRecord`.

#### Parameters

##### object

`unknown`

The object to check.

#### Returns

`object is CnsRecord`

`true` if the object is an instance of `CnsRecord` or has the same properties as a `CnsRecord`, `false` otherwise.

## Properties

### cid

> `readonly` **cid**: `string`

The content identifier (CID) of the CNS record.

***

### name

> `readonly` **name**: `string`

The name of the CNS record.

#### Implementation of

`Omit.name`
