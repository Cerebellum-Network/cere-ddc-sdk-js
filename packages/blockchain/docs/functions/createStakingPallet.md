[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / createStakingPallet

# Function: createStakingPallet()

> **createStakingPallet**(`api`): `StakingPallet`

DdcStaking pallet. NOTE: unlike the legacy `@polkadot/api` surface, this runtime's
`DdcStaking` (descriptor storage list: `Bonded`/`Ledger`/`Storages`/`Nodes`/
`Providers`/`LeavingStorages`/`ClusterBonded`/`ClusterLedger`) has NO `CDNs`
storage item and no CDN-node calls — CDN-node staking was removed from this
pallet. The CDN-facing reads in the task brief (`findStakedClusterIdByCdnNode…`/
`listStakedCdnNodes…`) are dropped from this interface; only storage-node +
cluster staking are implemented, matching what's actually on-chain.

## Parameters

### api

`CereApi`

## Returns

`StakingPallet`
