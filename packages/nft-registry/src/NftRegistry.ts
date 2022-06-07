import { NftAttach as PbNftAttach } from "@cere-ddc-sdk/proto";
import { NftAttach } from "./models/NftAttach";
import { GlobalNft, GlobalNftParams } from "@cere-ddc-sdk/core";
import { fetch } from "cross-fetch";

const BASE_PATH = "/api/rest/nft/registry";

export class NftRegistry {
  gatewayNodeUrl: string;

  constructor(gatewayNodeUrl: string) {
    this.gatewayNodeUrl = gatewayNodeUrl;
  }

  async attach(
    globalNftParams: GlobalNftParams,
    assetCid: string,
    proof: string
  ): Promise<boolean> {
    const globalNftId = GlobalNft.of(globalNftParams);
    const pbNftAttach: PbNftAttach = {
      globalNftId: globalNftId.getAsString(),
      assetCid: assetCid,
      proof: proof,
    };
    let response = await fetch(this.gatewayNodeUrl + BASE_PATH, {
      method: "POST",
      body: PbNftAttach.toBinary(pbNftAttach),
    });

    if (201 != response.status) {
      throw Error(
        `Failed to store. Response: status='${response.status}' body='${response.body}'`
      );
    }

    return true;
  }

  async findByNft(globalNftParams: GlobalNftParams): Promise<NftAttach> {
    const globalNftId = GlobalNft.of(globalNftParams);
    let response = await fetch(
      `${
        this.gatewayNodeUrl
      }${BASE_PATH}/search?globalNftId=${globalNftId.getAsString()}`,
      {
        method: "GET",
      }
    );

    if (200 != response.status) {
      throw Error(
        `Failed to find nft attach record with given NFT params. Response: status='${response.status}' body='${response.body}'`
      );
    }

    let pbNftAttach = PbNftAttach.fromBinary(
      new Uint8Array(await response.arrayBuffer())
    );
    if (!(await this.verifyProof(pbNftAttach.proof))) {
      throw new Error(
        `Invalid attachment proof. Response: status='${response.status}' body='${response.body}'`
      );
    }

    return this.toNftAttach(pbNftAttach);
  }

  async findByAsset(assetCid: string): Promise<NftAttach> {
    let response = await fetch(
      `${this.gatewayNodeUrl}${BASE_PATH}/search?assetCid=${assetCid}`,
      {
        method: "GET",
      }
    );

    if (200 != response.status) {
      throw Error(
        `Failed to find nft attach record with given asset CID. Response: status='${response.status}' body='${response.body}'`
      );
    }

    let pbNftAttach = PbNftAttach.fromBinary(
      new Uint8Array(await response.arrayBuffer())
    );
    if (!(await this.verifyProof(pbNftAttach.proof))) {
      throw new Error(
        `Invalid attachment proof. Response: status='${response.status}' body='${response.body}'`
      );
    }

    return this.toNftAttach(pbNftAttach);
  }

  private verifyProof(proof: string): Promise<boolean> {
    //TODO
    return Promise.resolve(true);
  }

  private toNftAttach(pb: PbNftAttach): NftAttach {
    return new NftAttach(pb.globalNftId, pb.assetCid, pb.proof);
  }
}
