# @cere-ddc-sdk/core

Utility package with common logic and classes (CID builder, Scheme for signing requests etc.)

## CID Builder

Utility service for building CID based on hash of data, hash algorithm `blake2b-256`.

### Setup

```typescript
import {CidBuilder} from "@cere-ddc-sdk/core";

const cidBuilder = new CidBuilder();
```

### Create CID

```typescript
const data = new Uint8Array([1, 2, 3, 4]);
const cid = cidBuilder.build(data);
```

## Scheme

Utility service for signing data using `ed25519` or `sr25519` algorithm.
`PolkadotDappScheme` is scheme service for signing through *Polkadot* browser extension.

### Setup

```typescript
import {Scheme} from "@cere-ddc-sdk/core";
import {mnemonicGenerate} from "@polkadot/util-crypto";

const schemeName = "sr25519";
const secretPhrase = mnemonicGenerate();
const scheme = await Scheme.createScheme(createScheme, secretPhrase);
```

### Sign data

```typescript
const data = new Uint8Array([1, 2, 3, 4]);
const signatureHex = await scheme.sign(data);
```

## Cipher

Utility service for encrypt data.

- `NaclCipher` is the default service that uses `Nacl` algorithm for encryption.
- `DEK` is is a data encryption key used to encrypt the data.

### Setup

```typescript
import {NaclCipher} from "@cere-ddc-sdk/core";

const cipher = new NaclCipher();
```

### Encrypt

```typescript
const data = new Uint8Array([1, 2, 3, 4]);
const dek = "/data/bob" // can be as Uint8Array

const encryptedData = cipher.encrypt(data, dek);
```

### Decrypt

```typescript
const encryptedData = new Uint8Array([1, 2, 3, 4]);
const dek = new Uint8Array([1, 2, 3, 4]) // can be as string

const data = cipher.decrypt(encryptedData, dek);
```