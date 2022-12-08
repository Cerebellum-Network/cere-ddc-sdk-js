import {hexToU8a, isHex} from '@polkadot/util';
import {mnemonicToMiniSecret, mnemonicValidate} from '@polkadot/util-crypto';
import nacl from 'tweetnacl';

export function getNaclBoxSecret(mainSecret: string, secondarySecret?: string): Uint8Array {
    const secret = secondarySecret == null ? mainSecret : secondarySecret;
    let boxSecret: Uint8Array;
    if (isHex(secret)) {
        boxSecret = hexToU8a(secret);
    } else {
        if (!mnemonicValidate(secret)) {
            throw Error(`Invalid mnemonic phrase is provided ${secret}`);
        }
        boxSecret = mnemonicToMiniSecret(secret);
    }

    if (boxSecret.length !== nacl.secretbox.keyLength) {
        throw Error(`Invalid length of secret seed is provided ${secret}`);
    }
    return boxSecret;
}
