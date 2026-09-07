[**@cere-ddc-sdk/ddc**](../README.md)

***

[@cere-ddc-sdk/ddc](../README.md) / UriSigner

# Class: UriSigner

A `Signer` from a mnemonic/seed with an optional `//hard/soft` derivation
path (keyring URI convention). An empty phrase is rejected (no silent dev
phrase). sr25519 by default; pass `{ type: 'ed25519' }` for ed25519.

## Extends

- [`KeyringSigner`](KeyringSigner.md)
