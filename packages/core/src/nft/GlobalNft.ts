//TODO: Add revert string to parts logic.
/** Representation of any NFT by its chain, smart contract address and inner id as hex string.
 */
export class GlobalNft {
  /** Chain of account with NFT.
   *
   *  Takes first 8 bytes at encoded string.
   */
  private readonly chain: Chain;
  /** Contract address with NFT.
   *
   *  Must be
   *
   *  Takes second 40 bytes at encoded string.
   */
  private readonly account: string;
  /** Smart contract inner NFT id with NFT.
   *
   *  Takes second 8 bytes at encoded string.
   */
  private readonly innerNftId: number;

  private computedString: string = "";


  private constructor(chain: Chain, account: string, innerNftId: number) {
    if (account.length !== 20) {
      throw new Error(`GlobalNFT error: Account address length must be equal to 20.`);
    }
    if (innerNftId < 1) {
      throw new Error(`GlobalNFT error: InnerNftId length must be positive.`);
    }
    this.chain = chain;
    this.account = account;
    this.innerNftId = innerNftId;
  }

  static of(_: GlobalNftParams): GlobalNft {
    const { chain, account, innerNftId } = _;
    return new GlobalNft(chain, account, innerNftId);
  }

  /** String representation getter function.
   *
   *
   */
  public getAsString(): string {
    if (!this.computedString) {
      this.computedString = this.makeRepresentation();
    }
    return this.computedString;
  }

  public getParts() {
    const { chain, account, innerNftId } = this;
    return { chain, account, innerNftId };
  }

  private makeRepresentation() {
    const content =
        this.padLeadingZeros(this.chain.toString(), 8) +
        this.account +
        this.padLeadingZeros(this.innerNftId.toString(), 8)
    return Buffer.from(content, "hex").toString("hex");
  }

  private padLeadingZeros(s: string, size: number): string {
    while (s.length < size) s = "0" + s;
    return s;
  }
}

export interface GlobalNftParams {
  chain: Chain;
  account: string;
  innerNftId: number;
}

export enum Chain {
  ETHEREUM = 0,
  POLYGON = 1,
}
