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

A quick guide of how to upload a file to DDC TESTNET using the `DdcClient` API.

1. Create a `DdcClient` instance

    ```ts
    import * as fs from 'fs';
    import { DdcClient, File, TESTNET } from '@cere-ddc-sdk/ddc-client';

    const seed = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
    const ddcClient = await DdcClient.create(seed, TESTNET);
    ```
    
    > The account used to create the instance should have positive balance and DDC deposit

2. Create a new public bucket

    ```ts
    const bucketId = await client.createBucket(clusterId, { isPublic: true });
    ```

3. Upload a file to DDC

    ```ts
    const filePath = './my-picture.jpg';
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const file = new File(fileStream, { size: fileStats.size });

    const fileUri = await fileStorage.store(bucketId, file);

    console.log('The uploaded file CID', fileUri.cid)
    ```

4. That is it. You can open the file from your browser

    ```ts
    const fileUrl = `https://storage.devnet.cere.network/${bucketId}/${fileUri.cid}`;

    console.log('The file URL', fileUrl);
    ```

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# Examples

- [Browser playground](/playground)

# License

Licensed under the [Apache License](./LICENSE)
