[@cere-ddc-sdk/blockchain](../README.md) / Blockchain

# Class: Blockchain

This class provides methods to interact with the Cere blockchain.

**`Example`**

```typescript
const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
const account = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const balance = await blockchain.getAccountFreeBalance(account);

console.log(balance);
```

## Other

### chainDecimals

• `get` **chainDecimals**(): `number`

The decimals of the chain's native token.

#### Returns

`number`

___

### batchAllSend

▸ **batchAllSend**(`sendables`, `options`): `Promise`\<`SendResult`\>

Sends a batch of transactions to the blockchain.
The transactions are sent in a single batch and are executed in the order they are provided.
If one transaction in the batch fails, the entire batch fails and no further transactions in the batch are processed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sendables` | `Sendable`[] | The transactions to send. |
| `options` | `SendOptions` | Options for sending the transactions. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the result of the batch of transactions.

**`Example`**

```typescript
const account = new UriSigner('//Alice');
const tx1 = blockchain.ddcCustomers.createBucket('0x...');
const tx2 = blockchain.ddcCustomers.createBucket('0x...');

const result = await blockchain.batchAllSend([tx1, tx2], { account });

console.log(result);
```

___

### batchSend

▸ **batchSend**(`sendables`, `options`): `Promise`\<`SendResult`\>

Sends a batch of transactions to the blockchain.
The transactions are sent in a single batch and are executed in the order they are provided.
If one transaction in the batch fails, the rest of the transactions in the batch will still be processed. The batch itself does not fail.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sendables` | `Sendable`[] | The transactions to send. |
| `options` | `SendOptions` | Options for sending the transactions. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the result of the batch of transactions.

**`Example`**

```typescript
const account = new UriSigner('//Alice');
const tx1 = blockchain.ddcCustomers.createBucket('0x...');
const tx2 = blockchain.ddcCustomers.createBucket('0x...');

const result = await blockchain.batchSend([tx1, tx2], { account });

console.log(result);
```

___

### disconnect

▸ **disconnect**(): `Promise`\<`void`\>

Disconnects from the blockchain.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the connection is closed.

**`Example`**

```typescript
await blockchain.disconnect();
```

___

### getAccountFreeBalance

▸ **getAccountFreeBalance**(`accountId`): `Promise`\<`bigint`\>

Retrieves the free balance of an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` | The account ID. |

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the free balance of the account.

**`Example`**

```typescript
const balance = await blockchain.getAccountFreeBalance('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');

console.log(balance);
```

___

### getCurrentBlockNumber

▸ **getCurrentBlockNumber**(): `Promise`\<`number`\>

Retrieves the current block number.

#### Returns

`Promise`\<`number`\>

A promise that resolves to the current block number.

Example usage:
```typescript
const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
const blockNumber = await blockchain.getCurrentBlockNumber();

console.log(blockNumber);
```

___

### getNextNonce

▸ **getNextNonce**(`address`): `Promise`\<`number`\>

Retrieves the next nonce for an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address of the account. |

#### Returns

`Promise`\<`number`\>

A promise that resolves to the next nonce for the account.

Example usage:
```typescript
const nonce = await blockchain.getNextNonce('5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu');

console.log(nonce);
```

___

### isReady

▸ **isReady**(): `Promise`\<`boolean`\>

Checks if the blockchain is ready.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the blockchain is ready.

**`Example`**

```typescript
const isReady = await blockchain.isReady();
console.log(isReady);
```

___

### send

▸ **send**(`sendable`, `options`): `Promise`\<`SendResult`\>

Sends a transaction to the blockchain.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sendable` | `Sendable` | The transaction to send. |
| `options` | `SendOptions` | Options for sending the transaction. |

#### Returns

`Promise`\<`SendResult`\>

A promise that resolves to the result of the transaction.

Example usage:
```typescript
const account = new UriSigner('//Alice');
const tx = blockchain.ddcCustomers.createBucket('0x...', { isPublic: true });

const result = await blockchain.send(sendable, { account });

console.log(result);
```

___

### connect

▸ **connect**(`options`): `Promise`\<[`Blockchain`](Blockchain.md)\>

Connects to the blockchain and returns a new instance of the Blockchain class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `BlockchainConnectOptions` | Options for connecting to the blockchain. |

#### Returns

`Promise`\<[`Blockchain`](Blockchain.md)\>

A promise that resolves to a new instance of the Blockchain class.

Example usage:
```typescript
const blockchain = await Blockchain.connect({ wsEndpoint: 'wss://rpc.testnet.cere.network/ws' });
```

## Pallets

### ddcClusters

• `Readonly` **ddcClusters**: [`DDCClustersPallet`](DDCClustersPallet.md)

The DDC Clusters pallet.

___

### ddcCustomers

• `Readonly` **ddcCustomers**: [`DDCCustomersPallet`](DDCCustomersPallet.md)

The DDC Customers pallet.

___

### ddcNodes

• `Readonly` **ddcNodes**: [`DDCNodesPallet`](DDCNodesPallet.md)

The DDC Nodes pallet.

___

### ddcStaking

• `Readonly` **ddcStaking**: [`DDCStakingPallet`](DDCStakingPallet.md)

The DDC Staking pallet.
