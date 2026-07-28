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

# Usage

A quick guide of how to upload a file to DDC Testnet using the `DdcClient` API.

> `@cere-ddc-sdk/ddc-client` 3.0 is ESM-only and requires Node **≥ 22.11**.
> Upgrading from 2.x? See [MIGRATION.md](../../MIGRATION.md) — the network
> presets (`TESTNET`/`DEVNET`/`MAINNET`) are gone, replaced by explicit
> `blockchain` / `clusterId` / `storageUrl` config.

1. Create a `DdcClient` instance

    ```ts
    import * as fs from 'fs';
    import { DdcClient, File, FileUri } from '@cere-ddc-sdk/ddc-client';

    const seed = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
    const clusterId = '0x...';
    const ddcClient = await DdcClient.create(seed, {
      blockchain: 'testnet',
      clusterId,
      storageUrl: 'https://storage.testnet.cere.network',
    });
    ```

    `blockchain` accepts a network name (`'mainnet' | 'testnet' | 'devnet'`), a
    websocket RPC URL, or an already-connected `CereClient`. Add `cdnUrl` to
    read through a separate endpoint; reads fall back to `storageUrl` without it.

    > The account used to create the instance should have positive balance and DDC deposit

2. Create a new public bucket

    ```ts
    const bucketId = await ddcClient.createBucket({ isPublic: true });
    ```

    The bucket is created in the cluster from `config.clusterId` — `createBucket`
    no longer takes a cluster argument.

3. Upload a file to DDC

    ```ts
    const filePath = './my-picture.jpg';
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const file = new File(fileStream, { size: fileStats.size });

    const fileUri = await ddcClient.store(bucketId, file);

    console.log('The uploaded file CID', fileUri.cid)
    ```

4. That is it. You can open the file from your browser:

    ```ts
    const fileUrl = `https://storage.testnet.cere.network/${bucketId}/${fileUri.cid}`;

    console.log('The file URL', fileUrl);
    ```
    or download it using the SDK
    ```ts
    const fileResponse = await ddcClient.read(fileUri);
    const content = await fileResponse.arrayBuffer();

    console.log(content);
    ```

    Reconstruct the URI later with `new FileUri(bucketId, cid)`.

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# Examples

- [Browser playground](../../playground)
- [NodeJS examples](../../examples/node/)

# License

Licensed under the [Apache License](./LICENSE)
