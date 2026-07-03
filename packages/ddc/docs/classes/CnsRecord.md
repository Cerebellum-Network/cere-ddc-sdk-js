[@cere-ddc-sdk/ddc](../README.md) / CnsRecord

# Class: CnsRecord

The `CnsRecord` class represents a CNS record.

**`Example`**

```typescript
const cid = '...';
const name = 'example';
const record = new CnsRecord(cid, name);

console.log(CnsRecord.isCnsRecord(record)); // true
```

## Hierarchy

- **`CnsRecord`**

  ↳ [`CnsRecordResponse`](CnsRecordResponse.md)

## Implements

- `Omit`\<`cns.Record`, ``"cid"`` \| ``"signature"``\>

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

## Properties

### cid

• `Readonly` **cid**: `string`

The content identifier (CID) of the CNS record.

___

### name

• `Readonly` **name**: `string`

The name of the CNS record.

#### Implementation of

Omit.name
