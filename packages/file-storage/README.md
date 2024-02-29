# @cere-ddc-sdk/file-storage

The package provides API for storing and reading large files to DDC

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/file-storage --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/file-storage
```

# Usage

A quick guide of how to upload a file to DDC TESTNET using the `FileStorage` API.

1. Create a `FileStorage` instance

    ```ts
    import * as fs from 'fs';
    import { FileStorage, File, TESTNET } from '@cere-ddc-sdk/file-storage';

    const bucketId = 1n;
    const seed = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';
    const fileStorage = await FileStorage.create(seed, TESTNET);
    ```
    
    > The account used to create the instance should have a positive balance, DDC deposit, and the bucket should be created in advance

2. Upload a file to DDC

    ```ts
    const filePath = './my-picture.jpg';
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const file = new File(fileStream, { size: fileStats.size });

    const fileCID = await fileStorage.store(bucketId, file);

    console.log('The uploaded file CID', fileCID)
    ```

3. That is it. You can open the file from your browser

    ```ts
    const fileUrl = `https://storage.testnet.cere.network/${bucketId}/${fileCID}`;

    console.log('The file URL', fileUrl);
    ```

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# License

Licensed under the [Apache License](./LICENSE)
