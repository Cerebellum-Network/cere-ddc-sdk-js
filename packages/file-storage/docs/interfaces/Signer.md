[**@cere-ddc-sdk/file-storage**](../README.md)

***

[@cere-ddc-sdk/file-storage](../README.md) / Signer

# Interface: Signer

A chain-free signer: a key identity plus a raw byte-signing primitive.
Structurally identical to `@cef-ai/signer`'s `Signer`, so a signer from
either repo (or a CEF wallet) satisfies this interface. Chain use is via
`toPolkadotSigner(signer)` — deliberately NOT a method here, to keep the
interface free of any chain-library type.
