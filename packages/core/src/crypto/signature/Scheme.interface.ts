export type SchemeName = "sr25519" | "ed25519";

export const isSchemeName = (val: unknown): val is SchemeName =>
    typeof val === 'string' && (val === 'sr25519' || val === 'ed25519');

export interface SchemeInterface {
    name: SchemeName;
    address: string;
    publicKey: Uint8Array;
    publicKeyHex: string;

    sign(data: Uint8Array): Promise<Uint8Array>
}
