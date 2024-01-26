[@cere-ddc-sdk/ddc](../README.md) / CnsApi

# Class: CnsApi

The `CnsApi` class provides methods to interact with the DDC CNS API.

**`Example`**

```typescript
import { CnsApi, GrpcTransport } from '@cere-ddc-sdk/ddc';

const transport = new GrpcTransport(...);
const cnsApi = new CnsApi(transport);
```

## Methods

### getRecord

▸ **getRecord**(`request`): `Promise`\<`undefined` \| `Record`\>

Retrieves a CNS record from DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `GetRequest` | An object that includes the token, bucket ID, and record name to retrieve. |

#### Returns

`Promise`\<`undefined` \| `Record`\>

The retrieved record with its signature.

**`Example`**

```typescript
const request: GetRequest = {
  token: '...',
  bucketId: '...',
  name: 'example'
};

const record = await cnsApi.getRecord(getRequest);

console.log(record);
```

___

### putRecord

▸ **putRecord**(`request`): `Promise`\<`Record`\>

Stores a CNS record to DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `PutRequest` | An object that includes the token, bucket ID, and record to store. |

#### Returns

`Promise`\<`Record`\>

The stored record with its signature.

**`Example`**

```typescript
const request: PutRequest = {
  token: '...',
  bucketId: '...',
  record: { ... }
};

const record = await cnsApi.putRecord(request);

console.log(record); //
```
