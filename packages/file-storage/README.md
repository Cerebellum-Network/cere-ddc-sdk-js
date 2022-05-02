# @cere-ddc-sdk/file-storage

## Example

### Setup

```typescript
import {FileStorage} from "@cere-ddc-sdk/file-storage";

const scheme = await Scheme.createScheme("sr25519", "0x93e0153dc...");
const gatewayUlrl = "https://node-0.gateway.devnet.cere.network";

const fileStorage = new FileStorage(scheme, gatewayUlrl);
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