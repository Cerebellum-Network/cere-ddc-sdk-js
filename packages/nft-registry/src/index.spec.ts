import { NftRegistry, NftAttach } from "./index";
import { Chain, GlobalNft, Scheme } from "@cere-ddc-sdk/core";
import {
  FileStorage,
  FileStorageConfig,
} from "@cere-ddc-sdk/file-storage/src/node";

describe("nft-registry integration tests", () => {
  const url = "http://localhost:8080";
  const testSubject = Scheme.createScheme(
    "ed25519",
    "0x93e0153dc0f0bbee868dc00d8d05ddae260e01d418746443fa190c8eacd9544c"
  ).then((scheme) => new FileStorage(scheme, url, new FileStorageConfig(2, 1)));

  test("upload asset, attach NFT and get attachment", async () => {
    // upload asset
    const storage = await testSubject;
    const bucketId = 4n;
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const assetUri = await storage.upload(bucketId, data);

    // attach NFT
    const nftRegistry = new NftRegistry(url);
    const globalNft = {
      chain: Chain.ETHEREUM,
      account: "9dd19dd19dd19dd19dd1",
      innerNftId: 42,
    };
    const proof = "b87e1111111111";
    const isOk: boolean = await nftRegistry.attach(
      globalNft,
      assetUri.cid,
      proof
    );
    expect(isOk).toBe(true);

    // get attachment by NFT
    const getByNftRes = await nftRegistry.findByNft(globalNft);
    expect(getByNftRes.assetCid).toEqual(assetUri.cid);

    // get attachment by asset CID
    const getByAssetCidRes = await nftRegistry.findByAsset(assetUri.cid);
    expect(getByAssetCidRes.globalNftId).toEqual(
      GlobalNft.of(globalNft).getAsString()
    );
  });
});
