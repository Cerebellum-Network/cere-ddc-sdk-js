# @cere-ddc-sdk/ddc

The package provides API for interacting with DDC Storage nodes.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/ddc --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/ddc
```

# Usage

The package provides various low-level APIs to work with DDC. Here is a simple example of how to upload a small piece of data using the `StorageNode` API.

```ts
import { StorageNode, StorageNodeMode, UriSigner, Piece } from '@cere-ddc-sdk/ddc';

const signer = new UriSigner('hybrid label reunion only dawn maze asset draft cousin height flock nation');
const storageNode = new StorageNode(signer, {
  mode: StorageNodeMode.Storage,
  logLevel: 'debug',
  grpcUrl: 'grpc://localhost:9091',
  httpUrl: 'http://localhost:8091',
});

const bucketId = 1n;
const content = new TextEncoder().encode('Hello DDC');
const piece = new Piece(content);

const cid = await storageNode.storePiece(bucketId, piece);

console.log('Stored piece CID', cid);
```

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# License

Licensed under the [Apache License](./LICENSE)
