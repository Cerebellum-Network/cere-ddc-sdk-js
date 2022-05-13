# @cere-ddc-sdk/file-storage

## Example

### Setup

```typescript
import {FileStorage} from "@cere-ddc-sdk/file-storage";

const scheme = await Scheme.createScheme("sr25519", "0x93e0153dc...");
const cdnUlrl = "https://node-0.cdn.devnet.cere.network";

const fileStorage = new FileStorage(scheme, cdnUlrl);
```

### Read

```typescript
const bucketId = 1n;
const cid = "QmbWqxBE...";

const fileStream: ReadableStream<Uint8Array> = fileStorage.read(bucketId, cid);
```

### Upload

#### Generic upload

```typescript
let stream: ReadableStream<Uint8Array>;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStream.upload(bucketId, stream);
```

#### Browser upload

```typescript
let blob: Blob;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStream.upload(bucketId, blob.stream());
```