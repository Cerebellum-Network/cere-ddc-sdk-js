import {
  SignerPayloadRaw,
  SignerResult,
} from "@polkadot/types/types/extrinsic";
import { SchemeInterface, SchemeName } from "./Scheme.interface";
import { assertSafeMessage } from "./Scheme";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { InjectedAccount } from "@polkadot/extension-inject/types";
import { waitReady } from "@polkadot/wasm-crypto";
import { decodeAddress } from "@polkadot/util-crypto";
import { web3FromAddress } from "@polkadot/extension-dapp";

/**
 * Browser only
 */
export class PolkadotDappScheme implements SchemeInterface {
  name: SchemeName = "sr25519";

  private constructor(
    public publicKey: Uint8Array,
    public address: string,
    public signRaw: (raw: SignerPayloadRaw) => Promise<SignerResult>
  ) {}

  static async createScheme(
    account: InjectedAccount
  ): Promise<PolkadotDappScheme> {
    await waitReady();
    let injector = await web3FromAddress(account.address);
    let signRaw = injector.signer.signRaw;

    if (!signRaw) {
      throw Error("Failed to initialize scheme");
    }

    return new PolkadotDappScheme(
      decodeAddress(account.address),
      account.address,
      signRaw
    );
  }

  get publicKeyHex(): string {
    return u8aToHex(this.publicKey);
  }

  async sign(data: Uint8Array): Promise<Uint8Array> {
    assertSafeMessage(data);

    const { signature } = await this.signRaw({
      address: this.address,
      data: u8aToHex(data),
      type: "bytes",
    });

    return hexToU8a(signature);
  }
}
