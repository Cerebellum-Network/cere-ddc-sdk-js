[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / ChainIncompatibleError

# Class: ChainIncompatibleError

Raised when the connected runtime doesn't actually support a call the papi
client needs — e.g. an older network whose runtime predates a pallet/call
shape. Surfaces a clear failure instead of a cryptic encode error.

## Extends

- `Error`

## Properties

### call?

> `readonly` `optional` **call?**: `string`

The pallet call that wasn't supported, e.g. `"DdcClustersGov.propose_activate_cluster_protocol"`.

***

### network?

> `readonly` `optional` **network?**: `string`

The Cere network whose runtime was incompatible.
