
export type SchemeName = "sr25519" | "ed25519";
export interface SchemeInterface {
    name: SchemeName;
    publicKeyHex: string;

    sign(data: Uint8Array): Promise<string>
}
