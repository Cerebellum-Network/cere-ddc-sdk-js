export class NftAttach {
  globalNftId: string;
  assetCid: string;
  proof: string;

  constructor(globalNftId: string, assetCid: string, proof: string) {
    this.globalNftId = globalNftId;
    this.assetCid = assetCid;
    this.proof = proof;
  }
}
