# @cere-ddc-sdk/content-addressable-storage

Basic package for working with data in DDC.

Support commands:

-   `store` - store data in DDC
-   `storeEncrypted` - store encrypted data in DDC
-   `read` - download piece with data from DDC
-   `readDecrypted` - download and decrypt piece with data from DDC
-   `search` - search pieces by tags and download from DDC

## Example

### Setup

Initialize client by cluster id and secret phrase.

```typescript
import {ContentAddressableStorage} from '@cere-ddc-sdk/content-addressable-storage';

const signatureAlgorithm = 'ed25519';
const secretPhrase = '0x9gh7...';
const cdnClusterId = 2n;

const storage = await ContentAddressableStorage.build(
    {
        clusterAddress: cdnClusterId,
        scheme: signatureAlgorithm,
    },
    secretPhrase,
);
```

### Store

Store piece with data in DDC.

```typescript
import {Piece, PieceUri, Tag} from '@cere-ddc-sdk/content-addressable-storage';

const data = new Uint8Array([1, 2, 3, 4]); // data for storing
const bucketId = 1n;
const tags = [new Tag('key', 'test')]; // tag for search
const piece = new Piece(data, tags);

const pieceUri: PieceUri = await storage.store(bucketId, piece);
```

### Store Encrypted

Store encrypted data in DDC.

```typescript
import {Piece} from '@cere-ddc-sdk/content-addressable-storage';

const data = new Uint8Array([1, 2, 3, 4]); // data for storing
const bucketId = 1n;
const tags = [new Tag('key', 'test')]; // tag for search
const piece = new Piece(data, tags);

const encryptionOptions = {dekPath: '/data/secret', dek: dekBytes};

const pieceUri = await storage.storeEncrypted(bucketId, piece, encryptionOptions);
```

### Read

Download piece from DDC.

```typescript
import {Piece} from '@cere-ddc-sdk/content-addressable-storage';

const bucketId = 1n;
const cid = 'b89mndf...'; // CID can get from pieceUri (pieceUri.cid)

const piece: Piece = await storage.read(bucketId, cid);
```

### Read Decrypted

Read and decrypt piece from DDC.

```typescript
import {Piece} from '@cere-ddc-sdk/content-addressable-storage';

const bucketId = 1n;
const cid = 'b89mndf...'; // CID can get from pieceUri (pieceUri.cid)

const piece: Piece = await storage.readDecrypted(bucketId, cid, dekBytes);
```

### Search data

Search by tags pieces and download.

```typescript
import {Piece, Query, SearchResult, Tag} from '@cere-ddc-sdk/content-addressable-storage';

const bucketId = 1n;
const tags = [new Tag('key', 'test')];
const skipData = false; // download pieces with data or metadata only
const query = new Query(bucketId, tags, skipData);

const searchResult: SearchResult = await storage.search(query);
const pieces: Array<Piece> = searchResult.pieces;
```
