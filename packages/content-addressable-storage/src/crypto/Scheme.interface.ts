export interface SchemeInterface {
    name: string;
    publicKeyHex: string;

    sign(data: Uint8Array): Promise<string>
}
