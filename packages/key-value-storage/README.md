# @cere-ddc-sdk/key-value-storage

Package for working with DDC data as Key-Value storage.

Support commands:
- `store` - store piece data with required key value
- `read` - read values (pieces) by key

## Example

### Setup

```typescript
import {KeyValueStorage} from "@cere-ddc-sdk/key-value-storage"
import {Scheme} from "@cere-ddc-sdk/content-addressable-storage"

//Create Scheme for signing requests
const signatureAlgorithm = "ed25519";
const privateKey = "0x9gh7...";
const scheme = await Scheme.createScheme(signatureAlgorithm, privateKey);

const gatewayUrl = "https://node-0.gateway.devnet.cere.network/";
const keyValueStorage = new KeyValueStorage(scheme, gatewayUrl);
```

### Store

```typescript
import {Piece, PieceUri} from "@cere-ddc-sdk/content-addressable-storage";

const data: Uint8Array = []; // some data for storing

const bucketId = 1n;
const key = "unique piece";
const piece = new Piece(data)

const pieceUri: PieceUri = await keyValueStorage.store(bucketId, key, piece);
```

### Read

```typescript
import {Piece} from "@cere-ddc-sdk/content-addressable-storage";

const keyValue = "unique piece";
const bucketId = 1n;

const pieces: Piece[] = await keyValueStorage.read(bucketId, keyValue);
```
