[**@cere-ddc-sdk/blockchain**](../README.md)

***

[@cere-ddc-sdk/blockchain](../README.md) / toPolkadotSigner

# Function: toPolkadotSigner()

> **toPolkadotSigner**(`signer`): `PolkadotSigner`

Adapt a chain-free `Signer` to papi's `PolkadotSigner` for extrinsic signing.

A signer that natively signs extrinsics (implements `NativePolkadotSigner`,
e.g. `Web3Signer` wrapping a browser extension) is used directly. Otherwise
a keypair-style signer is bridged via `signer.sign(bytes, 'extrinsic')` —
only sr25519/ed25519 map to a substrate MultiSignature; ecdsa/ethereum chain
signing is out of scope.

## Parameters

### signer

[`Signer`](../interfaces/Signer.md)

## Returns

`PolkadotSigner`
