[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / JsonSigner

# Class: JsonSigner

A `Signer` unlocked from an encrypted polkadot keystore JSON + passphrase.
Uses `@polkadot/util-crypto`/`@polkadot/keyring` for the keystore decrypt
only (no `@polkadot/api`). Decryption is eager: a wrong passphrase throws
from the constructor.

## Extends

- [`KeyringSigner`](KeyringSigner.md)
