[@cere-ddc-sdk/ddc](../README.md) / DagApi

# Class: DagApi

The `DagApi` class provides methods to interact with the DDC DAG API.

**`Example`**

```typescript
import { DagApi, GrpcTransport } from '@cere-ddc-sdk/ddc';

const transport = new GrpcTransport(...);
const dagApi = new DagApi(transport);
```

## Low level API

### getNode

▸ **getNode**(`request`): `Promise`\<`undefined` \| `Node`\>

Retrieves a DAG node from DDC.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `GetRequest` | An object that includes the access token and the CID of the node to retrieve. |

#### Returns

`Promise`\<`undefined` \| `Node`\>

The retrieved node as a `Node` object, or `undefined` if the node does not exist.

**`Example`**

```typescript
const request: GetRequest = { token: '...', cid: '...' };
const node = await dagApi.getNode(request);

console.log(node);
```

## Methods

### putNode

▸ **putNode**(`request`): `Promise`\<`Uint8Array`\>

Stores a node in DDC DAG.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `request` | `PutRequest` | An object that includes the access token and the node to store. |

#### Returns

`Promise`\<`Uint8Array`\>

The CID of the stored node as a `Uint8Array`.

**`Example`**

```typescript
const request: PutRequest = { token: '...', node: { ... } };
const cid = await dagApi.putNode(request);

console.log(cid);
```
