# Smart Contract Deposits Example

This example demonstrates how to use the DDC Client with Smart Contract Deposits instead of traditional pallet-based deposits.

## Overview

The example shows how to:
1. Create a deposit contract instance
2. Get balances from smart contract
3. Deposit funds via smart contract
4. Unlock and withdraw deposits via smart contract
5. Charge customers via smart contract for DAC-based payouts

## Prerequisites

- A deployed DDC Deposit Smart Contract that implements the required interfaces:
  - `DdcPayoutsPayer` (mandatory)
  - `DdcBalancesFetcher` (mandatory)
  - `DdcBalancesDepositor` (optional)
- The contract ABI
- Sufficient funds for deposits
- Access to a Cere Network node (DEVNET/TESTNET/MAINNET)

## Required Smart Contract Interfaces

### DdcPayoutsPayer (Mandatory)
```rust
#[ink::trait_definition]
pub trait DdcPayoutsPayer {
  #[ink(message)]
  fn charge(
    &mut self,
    vault: AccountId32,
    batch: Vec<(AccountId32, u128)>,
  ) -> Vec<(AccountId32, u128)>;
}
```

### DdcBalancesFetcher (Mandatory)
```rust
#[ink::trait_definition]
pub trait DdcBalancesFetcher {
  #[ink(message)]
  fn get_balance(&self, owner: AccountId32) -> Option<Ledger>;
  
  #[ink(message)]
  fn get_balances(&self, from_index: u64, limit: u64) -> Vec<Ledger>;
}
```

### DdcBalancesDepositor (Optional)
```rust
#[ink::trait_definition]
pub trait DdcBalancesDepositor {
  #[ink(message, payable)]
  fn deposit(&mut self) -> Result<(), Error>;

  #[ink(message, payable)]
  fn deposit_for(&mut self, owner: AccountId) -> Result<(), Error>;

  #[ink(message)]
  fn unlock_deposit(&mut self, value: Balance) -> Result<(), Error>;

  #[ink(message)]
  fn withdraw_unlocked(&mut self) -> Result<(), Error>;
}
```

## Usage

### 1. Initialize DDC Client
```typescript
import { DdcClient, DEVNET } from '@cere-ddc-sdk/ddc-client';

const ddcClient = await DdcClient.create('//Alice', DEVNET);
```

### 2. Create Deposit Contract Instance
```typescript
const contractAddress = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const contractAbi = {}; // Replace with actual ABI

const depositContract = ddcClient.createDepositContract(contractAddress, contractAbi);
```

### 3. Get Balance from Smart Contract
```typescript
const balance = await ddcClient.getContractBalance(
  contractAddress,
  contractAbi,
  accountId
);

if (balance) {
  console.log(`Total: ${balance.total}`);
  console.log(`Active: ${balance.active}`);
  console.log(`Unlocking chunks: ${balance.unlocking.length}`);
}
```

### 4. Deposit Funds via Smart Contract
```typescript
const depositAmount = 1000000000000000000n; // 1 CERE
const txHash = await ddcClient.depositViaContract(
  contractAddress,
  contractAbi,
  depositAmount
);
```

### 5. Unlock and Withdraw Deposits
```typescript
// Unlock deposit
const unlockAmount = 500000000000000000n; // 0.5 CERE
const unlockTxHash = await ddcClient.unlockDepositViaContract(
  contractAddress,
  contractAbi,
  unlockAmount
);

// Withdraw unlocked deposit
const withdrawTxHash = await ddcClient.withdrawUnlockedViaContract(
  contractAddress,
  contractAbi
);
```

### 6. Charge Customers for DAC-based Payouts
```typescript
const vaultAddress = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMae2Qu';
const chargeBatch = [
  [account1, 100000000000000000n], // 0.1 CERE
  [account2, 200000000000000000n]  // 0.2 CERE
];

const chargeResult = await ddcClient.chargeViaContract(
  contractAddress,
  contractAbi,
  vaultAddress,
  chargeBatch
);
```

## Running the Example

1. Install dependencies:
```bash
npm install
```

2. Update the contract address and ABI in the example:
```typescript
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contractAbi = YOUR_CONTRACT_ABI;
```

3. Run the example:
```bash
npm run start
```

## Benefits of Smart Contract Deposits

- **Flexibility**: Custom logic for deposit management
- **Composability**: Integration with other smart contracts
- **Transparency**: All logic is visible on-chain
- **Upgradability**: Contract can be upgraded without changing the protocol
- **Custom Events**: Emit custom events for better tracking

## Migration from Pallet-based Deposits

To migrate from pallet-based deposits to smart contract deposits:

1. Deploy the required smart contract interfaces
2. Update your application to use the new smart contract methods
3. Ensure the contract emits the required events
4. Test thoroughly on testnet before mainnet deployment

## Error Handling

The example includes comprehensive error handling for:
- Contract deployment issues
- Insufficient funds
- Transaction failures
- Network connectivity problems

## Security Considerations

- Always verify contract addresses
- Use proper access controls
- Implement proper validation
- Test thoroughly before mainnet deployment
- Monitor contract events for anomalies 