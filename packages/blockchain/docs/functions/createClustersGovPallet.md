[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / createClustersGovPallet

# Function: createClustersGovPallet()

> **createClustersGovPallet**(`api`): `ClustersGovPallet`

DdcClustersGov pallet: cluster-protocol governance proposals + votes.

All calls are writes — verified via encode (`getEncodedData`) +
`client.assertCompatible('DdcClustersGov', <call>)` against a live devnet
probe; no proposal is ever actually submitted by the tests.

Arg field names verified against the `DdcClustersGov` tx block in
`cereDevnet.d.ts` (descriptor types `Iah9p413nlasv4`/`I6iiotpri56hrl`/
`I6aga6jkk87fpa`/`I2rcppkjrla06r`/`I2u5oaj29tiqbr`/`I6qcgktnpolt59`):
both `propose_activate_cluster_protocol` AND `propose_update_cluster_protocol`
name their params arg `cluster_protocol_params` (not `protocol_params`/
`initial_protocol_params` — that latter name is `DdcClusters.create_cluster`'s,
a different pallet); `refund_submission_deposit` names its arg
`referenda_index` (not `index`).

## Parameters

### api

`CereApi`

## Returns

`ClustersGovPallet`
