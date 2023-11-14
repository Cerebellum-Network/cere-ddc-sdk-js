# @cere-ddc-sdk/blockchain

The package provides API for interacting the Cere blockchain.

# Installation

Using `NPM`:

```bash
npm install @cere-ddc-sdk/blockchain --save
```

Using `yarn`:

```bash
yarn add @cere-ddc-sdk/blockchain
```

# Generating types

Types can be generated from chain metadata by connecting to a running node (`ws://localhost:9944`) and doing a RPC call

```bash
npm run generate:types
```