import CID from "cids";

let multihashing = require("multihashing");

export class CidBuilder {
  build(data: Uint8Array): string {
    const hash = multihashing(data, "blake2b-256");
    const cid = new CID(1, "raw", hash);

    return cid.toString("base32");
  }
}
