import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady } from "@polkadot/util-crypto";

import { DdcStaking } from '@cere-ddc-sdk/ddc-staking';

describe('packages/ddc-staking/src/DdcStaking.ts', () => {
    const keyring = new Keyring({ type: "sr25519" });
    let stash: KeyringPair;
    let controller: KeyringPair;
    let ddcStaking: DdcStaking;

    beforeAll(async () => {
        await cryptoWaitReady();

        ddcStaking = new DdcStaking;
        stash = keyring.addFromUri("//Alice");
        controller = keyring.addFromUri("//Bob");
    });
});
