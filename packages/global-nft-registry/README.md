# @cere-ddc-sdk/global-nft-registry

The package provides API for interacting with Global NFT Registry on the Cere blockchain.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/global-nft-registry --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/global-nft-registry
```

# Create an instance

The `GlobalNftRegistry` instance can be created in two ways:

1.  Using the class constructor

    ```ts
    import {ApiPromise, WsProvider} from '@polkadot/api';
    import {ContractPromise} from '@polkadot/api-contract';
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/global-nft-registry';

    const {rpcUrl, contractAddress, abi} = DEVNET;

    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({provider});
    const contract = new ContractPromise(api, abi, contractAddress);
    const keyringPair = new Keyring({type: 'sr25519'}).addFromUri('//Alice');

    const smartContractInstance = new GlobalNftRegistry(keyringPair, contract);
    ```

    This approach is quite verbose and requires several extra packages. It can be used if you already have `api` and blockchain `contract` instances in your app.

2.  Using the `GlobalNftRegistry.buildAndConnect` static method

    ```ts
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/global-nft-registry';

    const seedOrPair = '...'; // Seed phrase or keyring pair
    const registryInstance = await GlobalNftRegistry.buildAndConnect(seedOrPair, DEVNET);
    ```

    or with external signer

    ```ts
    import { Signer } from '@polkadot/api/types';
    import { SmartContract, DEVNET } from '@cere-ddc-sdk/smart-contract';

    const address = '...'; // Account address
    const signer: Signer = {...}: // External signer
    const registryInstance = await GlobalNftRegistry.buildAndConnect(address, DEVNET, signer);
    ```

    `buildAndConnect` takes care of the following boilerplate that otherwise needs to be provided.

# API

### Address Structure

> When using the SDK, always format input addresses (including token owners and token contract addresses) as EVM addresses.

The Global NFT Registry substrate smart contract stores addresses for EVM wallet token owners and smart contracts as 32 Byte Account Ids, but when using these types outside of the registry we expect them to be 20 Byte Ethereum addresses. For this reason, the SDK endpoints take input as EVM addresses and converts them to Account Ids using helpers which are exposed by the SDK. 

To use the helpers manually, see the following:

```tsx
import {EvmAddress, AccountId} from '@cere-ddc-sdk/global-nft-registry/types';
import {accountIdToAddress, addressToAccountId} from '@cere-ddc-sdk/global-nft-registry';

const evmAddress: EvmAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
const accountId: AccountId = '0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d';

const accountIdEquivalent = addressToAccountId(evmAddress);
const evmEquivalent = accountIdToAddress(accountId);
```

### Initialise (Build and Connect)

- Using the Class Constructor
    
    ```tsx
    import {ApiPromise, WsProvider} from '@polkadot/api';
    import {ContractPromise} from '@polkadot/api-contract';
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/global-nft-registry';
    
    const {rpcUrl, contractAddress, abi} = DEVNET;
    
    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({provider});
    const contract = new ContractPromise(api, abi, contractAddress);
    const keyringPair = new Keyring({type: 'sr25519'}).addFromUri('//Alice');
    
    const smartContractInstance = new GlobalNftRegistry(keyringPair, contract);
    ```
    
    This approach is quite verbose and requires several extra packages. It can be used if you already have `api` and blockchain `contract` instances in your app.
    
- Using the `GlobalNftRegistry.buildAndConnect` static method
        
    ```tsx
    import {SmartContract, DEVNET} from '@cere-ddc-sdk/global-nft-registry';
    
    const seedOrPair = '...'; // Seed phrase or keyring pair
    const registryInstance = await GlobalNftRegistry.buildAndConnect(seedOrPair, DEVNET);
    ```
    
    or with external signer
    
    ```tsx
    import { Signer } from '@polkadot/api/types';
    import { SmartContract, DEVNET } from '@cere-ddc-sdk/smart-contract';
    
    const address = '...'; // Account address
    const signer: Signer = {...}: // External signer
    const registryInstance = await GlobalNftRegistry.buildAndConnect(address, DEVNET, signer);
    ```
    
    `buildAndConnect` takes care of the boilerplate that otherwise needs to be provided.
    

### Connect/Disconnect

- Connect to the blockchain:

```tsx
await registry.connect();
```

- Disconnect from the blockchain:

```tsx
await registry.disconnect();
```

### Update Registry


Update an owner's balance in the registry without transferring the token:

```tsx
const result = await registry.updateRegistry(chainId, tokenContract, tokenId, owner, balance);
```

### Transfer


Transfer a token to a new owner. Can also support Mint (from zero address) and Burn (to zero address) events:

```tsx
const result = await registry.transfer(chainId, tokenContract, tokenId, from, to, amount);
```

### Get Balance

Retrieve the balance of an owner:

```tsx
const balance = await registry.getBalance(chainId, tokenContract, tokenId, owner);

// OR using a key object:
const key = {chainId, tokenContract, tokenId, owner};
const balance = await registry.getBalanceByKey(key);
```

### Is Owner

Check if an account is the owner of a token:

```tsx
const isOwner = await registry.isOwner(chainId, tokenContract, tokenId, owner);
```

### Role Based Access Control

Grant or revoke roles to accounts:


```tsx
const grantResult = await registry.grantRole(role, account);
const revokeResult = await registry.revokeRole(role, account);
```

Check if an account has a specific role:

```tsx
const hasRole = await registry.hasRole(role, account);
```