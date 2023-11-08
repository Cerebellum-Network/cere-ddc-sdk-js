# @cere-ddc-sdk/file-storage

> After the major update `v2.0.0` the documentation below is outdated and no longer relevant. It will be updated before the final release.

Package for working with large data by splitting it to small pieces fixed size.

Support commands:

-   `read` - read file as `Uint8Array` stream
-   `upload` - upload `Uint8Array` stream to DDC

## Example

### Setup

```typescript
import {Scheme} from '@cere-ddc-sdk/core';
import {FileStorage} from '@cere-ddc-sdk/file-storage';

const signatureAlgorithm = 'sr25519';
const secretPhrase = '0x93e0153dc...';
const cdnUlrl = 'https://node-0.v2.us.cdn.testnet.cere.network'; // CDN cluster id or CDN url

const fileStorage = FileStorage.build({clusterAddress: cdnUlrl, scheme: signatureAlgorithm}, cdnUlrl, secretPhrase);
```

### Read

### Browser

Read data from DDC browser example.

```typescript
const bucketId = 1n;
const cid = 'QmbWqxBE...';

const fileStream: ReadableStream<Uint8Array> = fileStorage.read(bucketId, cid);
```

### NodeJS

Read data from DDC NodeJS example.

```typescript
import * as streamWeb from 'stream/web';

const bucketId = 1n;
const cid = 'QmbWqxBE...';

const fileStream: streamWeb.ReadableStream<Uint8Array> = fileStorage.read(bucketId, cid);
```

### Read Decrypted

Download and decrypt data from DDC.

```typescript
const bucketId = 1n;
const cid = 'bmbWqxBE...';
const dek = new Uint8Array([1, 2, 3, 4]);

const fileStream = fileStorage.readDecrypted(bucketId, cid, dek);
```

### Read Links

Download data by links.

```typescript
const bucketId = 1n;
const links = [new Link('bmbWqxBE...'), new Link('basddbEqasdxBE...')];
const dek = new Uint8Array([1, 2, 3, 4]);

const fileStream = fileStorage.readLinks(bucketId, links);
```

### Read Links Decrypted

Download data and decrypt by links.

```typescript
const bucketId = 1n;
const links = [new Link('bmbWqxBE...'), new Link('basddbEqasdxBE...')];
const dek = new Uint8Array([1, 2, 3, 4]);

const fileStream = fileStorage.readLinks(bucketId, links, dek);
```

### Upload

Upload command support many types of data:

-   Browser:
    -   `ReadableStream<Uint8Array>`
    -   `Blob`
    -   url as`string`
    -   `Uint8Array`
-   NodeJS:
    -   `ReadableStream<Uint8Array>` from `node:stream/web`
    -   `Readable` from `node:stream`
    -   `PathLike` from `fs`
    -   `Uint8Array`

#### Browser

Upload data to DDC Browser example.

```typescript
let data: ReadableStream<Uint8Array> | Blob | string | Uint8Array;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, data);
```

#### NodeJS

Upload data to DDC NodeJS example.

```typescript
import * as streamWeb from 'node:stream/web';
import {Readable} from 'node:stream';
import {PathLike} from 'fs';

let data: streamWeb.ReadableStream<Uint8Array> | Readable | PathLike | Uint8Array;
const bucketId = 1n;

const headPieceUri: Promise<PieceUri> = fileStorage.upload(bucketId, data);
```

### Upload Encrypted

Upload encrypted data to DDC.

```typescript
const bucketId = 1n;
const encryptionOptions = {dekPath: '/data/secret', dek: dekBytes};

const headPieceUri: Promise<PieceUri> = fileStorage.uploadEncrypted(bucketId, data, encryptionOptions);
```
