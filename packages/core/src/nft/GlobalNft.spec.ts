import { Chain, GlobalNft, GlobalNftParams } from "./GlobalNft";

describe("Global NFT create, encode and decode", () => {
  it("create", async () => {
    //given

    //when
    const parts: GlobalNftParams = {
      chain: Chain.ETHEREUM,
      account: "abcdabcdabcdabcdabcd",
      innerNftId: 12345,
    };
    let globalNft = GlobalNft.of(parts);

    //then
    expect(globalNft.getParts()).toEqual(parts);
  });

  it("encode and decode", async () => {
    //given
    const parts: GlobalNftParams = {
      chain: Chain.ETHEREUM,
      account: "abcdabcdabcdabcdabcd",
      innerNftId: 12345,
    };
    let globalNft = GlobalNft.of(parts);

    //when
    const str = globalNft.getAsString();

    //then
    expect(str).toBe("00000000abcdabcdabcdabcdabcd00012345");
  });
});
