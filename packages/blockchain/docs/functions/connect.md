[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / connect

# Function: connect()

> **connect**(`opts`): `CereClient`

Connect to a Cere node via papi. Pass `{ network, wsUrl? }` to select the
network's typed descriptors explicitly, or a bare WS URL (the network is
inferred). The papi client + descriptors are an internal detail.

## Parameters

### opts

`string` \| `ConnectOptions`

## Returns

`CereClient`
