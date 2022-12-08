import { mnemonicGenerate, mnemonicToLegacySeed, mnemonicToEntropy } from '@polkadot/util-crypto';
import {u8aToHex} from '@polkadot/util';

import { getNaclBoxSecret } from '../packages/ddc-client/src/lib/get-nacl-box-secret';

const seed = '0x46423dd616093f9ea9b5df65994c18c1c8a27a806c68d885d6effd01721d1492';
const mnemonic = 'motion gospel order sketch blast rack deer oppose manage burden broccoli foster';

describe('packages/ddc-client/src/lib/get-nacl-box-secret.ts', () => {
    it('should create secret from mnemonic', () => {
        expect(getNaclBoxSecret(mnemonicGenerate())).toBeInstanceOf(Uint8Array);
    });

    it('should create secret from seed', () => {
        const seed = u8aToHex(mnemonicToLegacySeed(mnemonicGenerate()));
        expect(getNaclBoxSecret(seed)).toBeInstanceOf(Uint8Array);
    });

    it('should create the same secrets for corresponding seed and mnemonic', () => {
        const s1 = Array.from(getNaclBoxSecret(mnemonic)).map(String).join('--');
        const s2 = Array.from(getNaclBoxSecret(seed)).map(String).join('--');
        expect(s1).toBe(s2);
    });

    it('should fail for incorrect mnemonics', () => {
        expect(() => getNaclBoxSecret(mnemonic.slice(0, -2))).toThrow();
        expect(() => getNaclBoxSecret('test')).toThrow();
        expect(() => getNaclBoxSecret(seed.slice(0, -1))).toThrow();
    });
});

