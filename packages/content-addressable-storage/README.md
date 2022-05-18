# @cere-ddc-sdk/content-addressable-storage

Basic package for working with data in DDC.

Support commands:
- `store` - store data in DDC
- `read` - download piece with data from DDC
- `search` - search pieces by tags and download from DDC

## Example

### Setup

```typescript
import {Scheme} from "@cere-ddc-sdk/core"
import {ContentAddressableStorage} from "@cere-ddc-sdk/content-addressable-storage"

//Create Scheme for signing requests
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
```

### Read
```typescript
import {Piece} from "@cere-ddc-sdk/content-addressable-storage"

const bucketId = 1n;
const cid = "b89mndf..."; // CID can get from pieceUri (pieceUri.cid)

const piece: Piece = await storage.read(bucketId, cid);
```

### Search

```typescript
import {Piece, Query, SearchResult, Tag} from "@cere-ddc-sdk/content-addressable-storage"

const bucketId = 1n;
const tags = [new Tag("key", "test")];
const query = new Query(bucketId, tags);

const searchResult: SearchResult = await storage.search(query);
const pieces: Array<Piece> = searchResult.pieces;
```