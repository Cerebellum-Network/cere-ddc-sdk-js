import {HexString} from './Blockchain';

export function hexEncode(s: string) {
    let hex: string;
    let encoded = '0x';
    for (let i = 0; i < s.length; i++) {
        hex = s.charCodeAt(i).toString(16);
        encoded += ('000' + hex).slice(-4);
    }

    return encoded as HexString;
}

export function hexDecode(hexString: HexString) {
    let hexes = hexString.replace('0x', '').match(/.{1,4}/g) || [];
    let decoded = '';
    for (let index = 0; index < hexes.length; index++) {
        decoded += String.fromCharCode(parseInt(hexes[index], 16));
    }

    return decoded;
}
