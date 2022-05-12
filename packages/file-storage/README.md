# @cere-ddc-sdk/file-storage

Package for working with large data by splitting it to small pieces fixed size.

Support commands:
- `read` - read file as `Uint8Array` stream
- `upload` - upload `Uint8Array` stream to DDC

## Example

JS doesn't have stream standard, so we decided to follow [WHATWG Streams Standard](https://streams.spec.whatwg.org/).
NodeJS can use implementation `ReadableStream` in package `stream/web` and browser can use from `dom` implementation.

### Setup

```typescript
import {FileStorage} from "@cere-ddc-sdk/file-storage";
import {Scheme} from "@cere-ddc-sdk/content-addressable-storage"

//Create Scheme for signing requests
const signatureAlgorithm = "sr25519";
const privateKey = "0x93e0153dc...";
const scheme = await Scheme.createScheme(signatureAlgorithm, privateKey);

const gatewayUlrl = "https://node-0.gateway.devnet.cere.network";
const fileStorage = new FileStorage(scheme, gatewayUlrl);
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

#### Browser upload

```typescript
let blob: Blob;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, blob.stream());
```

#### NodeJS upload

NodeJs can't read file to `ReadableStream` from `stream/web`, so we need some `Source` class.

```typescript
import * as streamWeb from "stream/web";
import {open, FileHandle} from 'node:fs/promises';
import {PathLike} from "node:fs";

class Source implements streamWeb.UnderlyingByteSource {

    private file!: FileHandle;
    private readonly filePath: PathLike;
    readonly type = "bytes";

    constructor(filePath: PathLike) {
        this.filePath = filePath;
    }

    async start(controller: streamWeb.ReadableByteStreamController) {
        this.file = await open(this.filePath, "r");
    }

    async pull(controller: streamWeb.ReadableByteStreamController) {
        const {bytesRead, buffer} = await this.file.read();

        if (bytesRead === 0) {
            await this.file.close();
            controller.close();
        }

        controller.enqueue(buffer)
    }

    async cancel() {
        await this.file.close()
    }
}
```

Upload from file to DDC

```typescript
import * as streamWeb from "stream/web";

let filePath: PathLike
const stream = new streamWeb.ReadableStream(new Source(filePath));

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, stream);
```