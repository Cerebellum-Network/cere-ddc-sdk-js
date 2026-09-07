# @cere-ddc-sdk/blockchain

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

The package provides a `connect()` function which returns a `CereClient` — an entry point exposing multiple DDC pallet wrappers, each of which is responsible for interacting with a particular DDC pallet on the blockchain.

> Upgrading from 2.x? See [MIGRATION.md](../../MIGRATION.md) for the full `Blockchain` -> `connect`/`CereClient` mapping.

Here is an example how to create a bucket

1. Connect a `CereClient` to TESTNET

    ```ts
    import { connect, UriSigner } from '@cere-ddc-sdk/blockchain';

    const signer = new UriSigner('bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice');
    const client = connect({ network: 'testnet' });
    ```

2. Make a deposit

    ```ts
    const clusterId = '0x...';
    const decimals = await client.chain.getChainDecimals();
    const deposit = 100n * 10n ** BigInt(decimals); // 100 CERE
    const tx = await client.customers.deposit(clusterId, deposit);

    await client.tx.send(tx, { signer })
    ```

    > The account used to make deposit and create the bucket should have positive CERE tokens balance.

3. Create a public bucket

    ```ts
    const tx = client.customers.createBucket(clusterId, { isPublic: true });

    const { events } = await client.tx.send(tx, { signer })
    const [bucketId] = client.customers.extractCreatedBucketIds(events);

    console.log('Bucket ID', bucketId);
    ```

4. Disconnect when done

    ```ts
    client.disconnect();
    ```

# Documentation

For more information about what this package provides, see [API reference](./docs/README.md)

# License

Licensed under the [Apache License](./LICENSE)
