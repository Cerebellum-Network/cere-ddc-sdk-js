# @cere-ddc-sdk/file-storage

The package provides API for interacting with Cere blockchain.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/blockchain --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/blockchain
```

# Usage

The package provides `Blockchain` class which acts as an entry point and multiple DDC pallet wrappers, each of which is responsible for interacting with a particular DDC pallet on the blockchain.

Here is an example how to create a bucket

1. Create a `Blockchain` instance and connect it to TESTNET

    ```ts
    import { Blockchain, UriSigner } from '@cere-ddc-sdk/blockchain';

    const account = new UriSigner('//Alice');
    const blockchain = await Blockchain.connect({
      wsEndpoint: 'wss://rpc.testnet.cere.network/ws',
    });
    ```

2. Make a deposit

    ```ts
    const deposit = 100n * 10n ** blockchain.chainDecimals; // 100 CERE
    const tx = blockchain.ddcCustomers.deposit(deposit);

    await blockchain.send(tx, { account })
    ```

    > The account used to make deposit and create the bucket should have positive CERE tokens balance.

3. Create a public bucket

    ```ts
    const clusterId = '0x...';
    const tx = blockchain.ddcCustomers.createBucket(clusterId, { isPublic: true });

    const { events } = await blockchain.send(tx, { account })
    const [bucketId] = blockchain.ddcCustomers.extractCreatedBucketIds(events);

    console.log('Bucket ID', bucketId);
    ```

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# License

Licensed under the [Apache License](./LICENSE)
