[**@cere-ddc-sdk/ddc-client**](../README.md)

***

[@cere-ddc-sdk/ddc-client](../README.md) / CereWalletSigner

# Class: CereWalletSigner

Adapts an already-connected Cere wallet signing account (e.g. from
`@cere/embed-wallet`) to a chain-free `Signer` via constructor injection:
address, public key, curve type, and a raw `(bytes) => signature` callback.

This is a pure constructor-injection adapter and does NOT import
`@cere/embed-wallet` at all — `@cere/embed-wallet` is an optional peer
dependency of this package, and its `Signer.signMessage(message: string):
Promise<string>` API signs a *string* and returns a *string* signature
(encoding unspecified/not guaranteed stable), which doesn't line up with
the raw-bytes-in/raw-bytes-out callback `sign()` needs. Rather than bake in
an encoding guess, the caller supplies the byte-level `signFn` (wrapping
`EmbedWallet#getSigner().signMessage()` — or any other signer — however
their app's encoding requires), keeping this class free of a
runtime/type dependency on the embed wallet package.

## Implements

- [`Signer`](../interfaces/Signer.md)
