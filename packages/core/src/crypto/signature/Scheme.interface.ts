export type SchemeName = "sr25519" | "ed25519";

export interface SchemeInterface {
    name: SchemeName;
    publicKeyHex: string;

    sign(data: Uint8Array): Promise<string>
}

// Validate that the signed data does not conflict with the blockchain extrinsics.
export function assertSafeMessage(data: Uint8Array) {

    // Encoded extrinsics start with the pallet index; reserve up to 48 pallets.
    // Make ASCII "0" the smallest first valid byte.
    if (data[0] < 48) {
        throw Error("data unsafe to sign")
    }
}
