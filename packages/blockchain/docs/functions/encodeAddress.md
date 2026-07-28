[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / encodeAddress

# Function: encodeAddress()

> **encodeAddress**(`publicKeyOrAddress`, `ss58Format?`): `string`

Encode a public key (or re-encode an address) to a Cere ss58 address.
papi-native replacement for `@polkadot/util-crypto`'s `encodeAddress`.

## Parameters

### publicKeyOrAddress

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

### ss58Format?

`number` = `CERE_SS58`

## Returns

`string`
