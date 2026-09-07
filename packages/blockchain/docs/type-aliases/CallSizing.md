[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / CallSizing

# Type Alias: CallSizing

> **CallSizing** = `object`

Gas + storage-deposit ceiling for one contract call, sized by dry run.

## Properties

### storageDepositLimit

> **storageDepositLimit**: `bigint`

Explicit `storage_deposit_limit`. Never `undefined` — see `sizeCall`.
