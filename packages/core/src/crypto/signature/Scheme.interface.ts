
export type SchemeName = "sr25519" | "ed25519";
export interface SchemeInterface {
    name: SchemeName;
    publicKey: Uint8Array;
    publicKeyHex: string;

    sign(data: Uint8Array): Promise<Uint8Array>
}
