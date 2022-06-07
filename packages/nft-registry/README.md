# @cere-ddc-sdk/nft-registry

Basic package for working with DDC NFT registry.

Support commands:
- `attach` - attach asset in DDC with NFT
- `find` - find by nft or asset id

## Example

### Setup
```typescript
import {Scheme} from "@cere-ddc-sdk/core"
import {FileStorage} from "@cere-ddc-sdk/file-storage";
import {NftRegistry} from "@cere-ddc-sdk/nft-registry";

//Create Scheme for signing requests
const signatureAlgorithm = "sr25519";
const privateKey = "0x93e0153dc...";
const scheme = await Scheme.createScheme(signatureAlgorithm, privateKey);

const gatewayUlrl = "https://node-0.gateway.devnet.cere.network";
const fileStorage = new FileStorage(scheme, gatewayUlrl);

//Create NFT registry instance
const nftRegistry = new NftRegistry(gatewayUlrl);
```

### Attach
```typescript
import {Chain} from "@cere-ddc-sdk/core"

let data: ReadableStream<Uint8Array> | Blob | string | Uint8Array;
const bucketId = 1n;

const assetUri: Promise<PieceUri> = fileStorage.upload(bucketId, data);
const proof = "Oxb87e...";  //mint transaction of NFT
const isOk: boolean = await nftRegistry.attach({
    chain: Chain.ETHEREUM,      //chain of account with nft
    account: "9ddd..",     //contract address with nft
    nftId: 42             //inner nft id of contract with nft
}, assetUri.cid, proof);
```

### Search

### Find by NFT
```typescript
import {Chain} from "@cere-ddc-sdk/core"

const { assetCid, proof } = await nftRegistry.findByNft({
    chain: Chain.ETHEREUM,  //chain of account with nft
    account: "9ddd..",     //contract address with nft
    innerNftId: 42        //inner nft id of contract with nft
})
```

### Find by asset id
```typescript
const assetCid = "QmbWqxBE...";

const { globalNftId: {
    chain,      //chain of account with nft
    account,    //contract address with nft
    innerNftId  //inner nft id of contract with nft
}, proof } = await nftRegistry.findByAssetCid(assetCid);
```
