# @cere-ddc-sdk/ddc-client

The DDC Client package provides easy-to-use wrapper around low-level APIs calls that flow from an application to a DDC infrastructure. It handles all required blockchain operations as well as provides concise API to store and read objects.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/ddc-client --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/ddc-client
```

# Create an instance

The `DdcClient` instance can be created using static `create` method

### Arguments

- `account` - a string seed phrase or an instance of [Signer](/packages/blockchain/src/Signer/Signer.ts) interface
- `options` - the client configuration object

  ```ts
  type Config = {
    blockchain: string; // CERE blockchain rpc endpoint
    nodes?: {
      // Optional, predefined list of nodes, by default retrieved from blockchain
      grpcUrl: string; // gRPC endpoint for NodeJs communication
      httpUrl: string; // WebSocket endpoint for Web communication
    }[];
  };
  ```

  The package also exports several configuration presets which can be found [here](packages/ddc/src/presets.ts)

- `options.logLevel` - Specifies the level of logs to be recorded (`warn` by default)
- `options.logOptions` - Specifies the configuration options for the logger. This can include output options such as writing logs to a file or console, and the log level for each output (`console` by default)

### Example

```ts
import { DdcClient, TESTNET } from '@cere-ddc-sdk/ddc-client';

const seed = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
const ddcClient = await DdcClient.create(seed, {
  ...TESTNET,
  logLevel: 'debug',
  logOptions: {
    output: [
      { type: 'console' },
      {
        type: 'file',
        path: './logs/ddc-client.log',
      },
    ],
  },
});
```

# API

`DdcClient` instance methods

- [createBucket()](#createbucket)
- [getBucket()](#getbucket)
- [getBucketList()](#getbucketlist)
- [store()](#store)
- [read()](#read)

## createBucket()

Creates a new bucket and returns its ID

### Arguments

- `clusterId` - the ID of a cluster to which the bucket will be connected

### Example

```ts
import type { ClusterId, BucketId } from '@cere-ddc-sdk/ddc-client';

const clusterId: ClusterId = '0x...';
const bucketId: BucketId = await ddcClient.createBucket(clusterId);
```

## getBucket()

Returns information about a bucket by the bucket ID, or `undefined` if the bucket not found

### Arguments

- `bucketId` - requested bucket ID

### Example

```ts
import type { BucketId, Bucket } from '@cere-ddc-sdk/ddc-client';

const bucketId: BucketId = 1n;
const bucket: Bucket = await ddcClient.getBucket(bucketId);
```

## getBucketList()

Returns all available buckets information

### Example

```ts
import type { Bucket } from '@cere-ddc-sdk/ddc-client';

const buckets: Bucket[] = await ddcClient.getBucketList();
```

## store()

Stores an object to DDC. The object can be either `File` or `DagNode`

### Arguments

- `bucketId` - Bucket ID to store the object to
- `object` - Object to store: `File` or `DagNode`
- `options` - Operation options
  - `name` - CNS name to assign to the created object

### Example

Store a file to DDC bucket from NodeJS

```ts
import { statSync, createReadStream } from 'fs';
import { File, FileUri } from '@cere-ddc-sdk/ddc-client';

const bucketId = 1n;
const fileStats = statSync(filePath);
const fileStream = createReadStream(filePath);
const file = new File(fileStream, { size: fileStats.size });

const fileUri = await ddcClient.store(bucketId, file, {
  name: 'my-first-file', // CNS name of the file
});

console.log(fileUri.cid);
```

Store a DagNode to DDC bucket

```ts
import { DagNode, Tag, Link, DagNodeUri } from '@cere-ddc-sdk/ddc-client';

const bucketId = 1n;
const tags: Tag[] = [];
const links: Link[] = []; // Links to another node or file
const dagNode = new DagNode('Some data', links, tags);

const nodeUri: DagNodeUri = await client.store(bucketId, dagNode, {
  name: 'my-first-dag-node', // CNS name of the DAG node
});

console.log(nodeUri.cid);
```

## read()

Reads an object from DDC. The object can be either `File` or `DagNode`

### Arguments

- `objectUri` - `DdcUri` instance or its subclass (`FileUri` or `DagNodeUri`)
- `options` - Operation options
  - `path` - Optional path argument to traverse the DAG Node links by their names (available only for DAG nodes)
  - `range` - Optional range argument to read a part of the requested file (available only for files)

### Example

Read a file from DDC

```ts
import { FileUri } from '@cere-ddc-sdk/ddc-client';

const bucketId = 1n;
const nodeResponse = await ddcClient.read(nodeUri, {
  range: {
    // Optional range argument to read a part of the requested file
    start: 0,
    end: 16383, // First 16 KB (the range should be aligned to 16 KB)
  },
});

const text = await nodeResponse.text(); // It is also possible to read `arrayBuffer()` or `json()`

console.log(text);
```

Read a DAG Node from DDC

```ts
import { DagNodeUri } from '@cere-ddc-sdk/ddc-client';

const bucketId = 1n;
const nodeUri = new DagNodeUri(bucketId, 'my-first-dag-node'); // the DAG Node CID can be used instead of CNS name

const nodeResponse = await ddcClient.read(nodeUri, {
  path: '', // Optional path argument to traverse the DAG Node links by their names. EG. `root/link1/link2`
});

console.log(nodeResponse.data.toString()); // Some data
```

# Links

- [Tests](/tests/specs/DdcClient.spec.ts)
- [Browser example](/playground)
