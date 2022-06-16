# @cere-ddc-sdk/file-storage

Package for working with large data by splitting it to small pieces fixed size.

Support commands:

- `read` - read file as `Uint8Array` stream
- `upload` - upload `Uint8Array` stream to DDC

## Example

### Setup

```typescript
import {Scheme} from "@cere-ddc-sdk/core"
import {FileStorage} from "@cere-ddc-sdk/file-storage";

//Create Scheme for signing requests
const signatureAlgorithm = "sr25519";
const privateKey = "0x93e0153dc...";
const scheme = await Scheme.createScheme(signatureAlgorithm, privateKey);

const cdnUlrl = "https://node-0.cdn.devnet.cere.network";
const fileStorage = new FileStorage(scheme, cdnUlrl);
```

### Read

### Browser read

```typescript
const bucketId = 1n;
const cid = "QmbWqxBE...";

const fileStream: ReadableStream<Uint8Array> = fileStorage.read(bucketId, cid);
```

### NodeJs read

```typescript
import * as streamWeb from "stream/web";

const bucketId = 1n;
const cid = "QmbWqxBE...";

const fileStream: streamWeb.ReadableStream<Uint8Array> = fileStorage.read(bucketId, cid);
```

### Upload

Upload command support many types of data:

- Browser:
    - `ReadableStream<Uint8Array>`
    - `Blob`
    - `string`
    - `Uint8Array`
- NodeJS:
    - `ReadableStream<Uint8Array>` from `node:stream/web`
    - `Readable` from `node:stream`
    - `PathLike` from `fs`
    - `Uint8Array`

#### Browser upload

```typescript
let data: ReadableStream<Uint8Array> | Blob | string | Uint8Array;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, data);
```

#### NodeJS upload

```typescript
import * as streamWeb from "node:stream/web";
import {Readable} from "node:stream";
import {PathLike} from "fs";

let data: streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, data);
```