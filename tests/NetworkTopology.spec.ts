import {ApiPromise} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {ContractOptions} from '@polkadot/api-contract/types';
import {KeyringPair} from '@polkadot/keyring/types';

import {bootstrapContract, createBlockhainApi, createSigner, getGasLimit, signAndSend, CERE} from './helpers';

describe('Network topology', () => {
    let api: ApiPromise;
    let signer: KeyringPair;
    let contract: ContractPromise;
    let contractOption: ContractOptions;

    beforeAll(async () => {
        api = await createBlockhainApi();
        signer = await createSigner();
        contract = await bootstrapContract(api, signer);
        contractOption = {
            gasLimit: await getGasLimit(api),
        };
    });

    afterAll(async () => {
        await api.disconnect();
    });

    it('should have no cdn clusters', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.cdnClusterList(
            signer.address,
            contractOption,
            offset,
            limit,
            filterManagerId,
        );
        const [list] = result.output?.toHuman() as [any[], number];

        expect(list).toEqual([]);
    });

    it.skip('should have no storage clusters', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.clusterList(signer.address, contractOption, offset, limit, filterManagerId);
        const [list] = result.output?.toHuman() as [any[], number];

        expect(list).toEqual([]);
    });

    it.skip('should have no CDN nodes', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.cdnNodeList(signer.address, contractOption, offset, limit, filterManagerId);
        const [list] = result.output?.toHuman() as [any[], number];

        expect(list).toEqual([]);
    });

    it.skip('should have one default storage nodes', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.nodeList(signer.address, contractOption, offset, limit, filterManagerId);
        const [list] = result.output?.toHuman() as [any[], number];

        expect(list).toEqual([]);
    });

    describe('Storage cluster management', () => {
        let clusterId: string;

        test('add storage cluster', async () => {
            const vNodes: BigInt[][] = [];
            const nodeIds: string[][] = [];
            const jsonParams = JSON.stringify({
                replicationFactor: 1,
                status: 'CREATED',
            });

            const clusterQueryResult = await contract.query.clusterCreate(
                signer.address,
                contractOption,
                signer.address, // TODO: What is the address argument? Unused?
                vNodes,
                nodeIds,
                jsonParams,
            );

            clusterId = clusterQueryResult.output?.toHuman() as string; // TODO: Optimistic clusterId? Like auto-increment?

            const createTx = contract.tx.clusterCreate(
                {
                    ...contractOption,
                    value: 10n * CERE,
                },
                signer.address,
                vNodes,
                nodeIds,
                jsonParams,
            );

            await signAndSend(createTx, signer);

            const listResult = await contract.query.clusterList(signer.address, contractOption, 0, 10, undefined);
            const [list] = listResult.output?.toHuman() as [any[], number];

            expect(clusterId).toBeTruthy();
            expect(list).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        clusterId,
                    }),
                ]),
            );
        });

        test.todo('add storage node');
        test.todo('remove storage node');
        test.todo('remove storage cluster');
    });

    describe('CDN cluster management', () => {
        test.todo('add CDN cluster');
        test.todo('add CDN node');
        test.todo('remove CDN node');
        test.todo('remove CDN cluster');
    });

    describe('Storage & CDN topology', () => {
        test.todo('setup network topology');
        it.todo('should list storage clusters');
        it.todo('should list CDN clusters');
        it.todo('should list CDN nodes in a cluster');
        it.todo('should list storage nodes in a cluster');
        it.todo('should react to topology update events');
    });
});
