import { Binary } from 'polkadot-api';
import { connect } from '@cere-ddc-sdk/blockchain';

const describeChain = process.env.CERE_CHAIN_TESTS ? describe : describe.skip;

describeChain('papi staking (live, devnet)', () => {
  it('read methods return domain shapes (or undefined) against devnet', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const storages = await client.staking.listStakedStorageNodesStashAccountsAndClusterIds();
      expect(Array.isArray(storages)).toBe(true);
      if (storages.length) {
        expect(typeof storages[0].stashAccountId).toBe('string');
        expect(storages[0].clusterId).toMatch(/^0x/);

        const stash = storages[0].stashAccountId;
        const controller = await client.staking.findControllerAccountByStashAccountId(stash);
        expect(controller === undefined || typeof controller === 'string').toBe(true);

        if (controller) {
          const ledger = await client.staking.findStakingLedgerByControllerAccountId(controller);
          if (ledger) {
            expect(typeof ledger.total).toBe('bigint');
            expect(typeof ledger.active).toBe('bigint');
            expect(ledger.chilling === null || typeof ledger.chilling === 'number').toBe(true);
            expect(Array.isArray(ledger.unlocking)).toBe(true);
          }
        }

        const clusterId = await client.staking.findStakedClusterIdByStorageNodeStashAccountId(stash);
        expect(clusterId === undefined || (typeof clusterId === 'string' && clusterId.startsWith('0x'))).toBe(true);

        const nodeKey = await client.staking.findNodePublicKeyByStashAccountId(stash);
        if (nodeKey) {
          expect(typeof nodeKey.storagePubKey).toBe('string');
        }
      }

      const missing = await client.staking.findControllerAccountByStashAccountId(
        '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
      );
      expect(missing === undefined || typeof missing === 'string').toBe(true);

      const missingStash = await client.staking.findStashAccountIdByStorageNodePublicKey(
        '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL' as any,
      );
      expect(missingStash === undefined || typeof missingStash === 'string').toBe(true);
    } finally {
      client.disconnect();
    }
  }, 60_000);

  it('all write builders encode + are runtime-compatible (no submit)', async () => {
    const client = connect({ network: 'devnet' });
    try {
      const acct = '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL';
      // `key` (a StorageNodePublicKey) is encoded via papi's `AccountId` codec, same as
      // any other account field on this chain (verified live — see task-6-report.md:
      // `DdcStaking.Nodes`'s key/`Providers`'s value both decode to a plain SS58
      // string) — it must be a validly-checksummed SS58 address, not a hex literal
      // (unlike `clusterId`, which is a genuine `SizedHex<20>`). Reuse `acct`: this is
      // a pure-encode test (no submit), so any valid SS58 string round-trips fine.
      const key = acct as any;
      const clusterId = ('0x' + '11'.repeat(20)) as any;
      const builders = [
        client.staking.bondStorageNode(acct, key, 1_000_000_000n),
        client.staking.chill(),
        client.staking.fastChillStorage(),
        client.staking.unbond(1n),
        client.staking.withdrawUnbonded(),
        client.staking.setController(acct),
        client.staking.setStorageNode(key),
        client.staking.store(clusterId),
        client.staking.bondCluster(clusterId),
        client.staking.unbondCluster(clusterId),
        client.staking.withdrawUnbondedCluster(clusterId),
      ];
      for (const b of builders) {
        expect(Binary.toHex(await b.getEncodedData())).toMatch(/^0x/);
      }
      for (const call of [
        'bond',
        'chill',
        'fast_chill',
        'unbond',
        'withdraw_unbonded',
        'set_controller',
        'set_node',
        'store',
        'bond_cluster',
        'unbond_cluster',
        'withdraw_unbonded_cluster',
      ]) {
        await client.assertCompatible('DdcStaking', call);
      }
    } finally {
      client.disconnect();
    }
  }, 60_000);
});
