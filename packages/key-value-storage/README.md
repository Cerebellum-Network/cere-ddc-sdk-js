# @cere-ddc-sdk/key-value-storage

Package for working with DDC data as Key-Value storage.

Support commands:

- `store` - store piece data with required key value
- `read` - read values (pieces) by key

## Example

### Setup

Initialize client by cluster id and secret phrase.

```typescript
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage"

const signatureAlgorithm = "ed25519";
const secretPhrase = "own ranch execute unknown equal will...";
const cdnClusterId = 0n;

const keyValueStorage = await KeyValueStorage.build({
    clusterAddress: cdnClusterId,
    scheme: signatureAlgorithm
}, secretPhrase);
```

### Store

Store piece data with key in DDC.

```typescript
import {Piece, PieceUri} from "@cere-ddc-sdk/content-addressable-storage";

const data = new Uint8Array([1, 2, 3, 4, 5]);
const bucketId = 1n;
const key = "abcd";
const piece = new Piece(data)

const pieceUri: PieceUri = await keyValueStorage.store(bucketId, key, piece);
```

### Read

Read piece data by key.

```typescript
import {Piece} from "@cere-ddc-sdk/content-addressable-storage";

const keyValue = "abcd";
const bucketId = 1n;

const pieces: Piece[] = await keyValueStorage.read(bucketId, keyValue);
```
