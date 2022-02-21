export function stringToU8a(value: string): Uint8Array {
    const u8a = new Uint8Array(value.length);

    for (let i = 0; i < value.length; i++) {
        u8a[i] = value.charCodeAt(i);
    }

    return u8a;
}

export function hexToU8a(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw "Must have an even number of hex digits to convert to bytes";
    }
    let numBytes = hex.length / 2;
    let byteArray = new Uint8Array(numBytes);
    for (let i = 0; i < numBytes; i++) {
        byteArray[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return byteArray;
}

export function u8aToHex(bytes: Uint8Array) {
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
        let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}
