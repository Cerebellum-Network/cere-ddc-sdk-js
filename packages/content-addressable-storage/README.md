# @cere-ddc-sdk/content-addressable-storage

## Example

### Setup

```typescript
import {Scheme, ContentAddressableStorage} from "@cere-ddc-sdk/content-addressable-storage"

//Create Scheme for sign requests
const signatureAlgorithm = "ed25519";
const privateKey = "0x9gh7...";
const scheme = await Scheme.createScheme(signatureAlgorithm, privateKey);

const gatewayUrl = "https://node-0.gateway.devnet.cere.network/";
const storage = new ContentAddressableStorage(scheme, gatewayUrl);
```

### Store

```typescript
import {Piece, PieceUri, Tag} from "@cere-ddc-sdk/content-addressable-storage"

const data: Uint8Array = []; // some data for storing

const bucketId = 1n;
const tags = [new Tag("key", "test")]; // some tag for search
const piece = new Piece(data, tags);

const pieceUri: PieceUri = await storage.store(bucketId, piece);

const cid = pieceUri.cid;
```

### Read
```typescript
import {Piece} from "@cere-ddc-sdk/content-addressable-storage"

const bucketId = 1n;
const cid = "b89mndf..."; // CID can get from pieceUri (pieceUri.cid)

const piece: Piece = await storage.read(bucketId, cid);
```