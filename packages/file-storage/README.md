# @cere-ddc-sdk/file-storage

Package for working with large data by splitting it to small pieces fixed size.

Support commands:
- `read` - read file as `Uint8Array` stream
- `upload` - upload `Uint8Array` stream to DDC

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

JS doesn't have basic byte stream abstraction, so upload command for browser or server side(NodeJs) may differ.
NodeJS has implementation in package `stream/web` and browser `dom` implementation.

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