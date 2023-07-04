import {ApiPromise} from '@polkadot/api';
import {ContractPromise} from '@polkadot/api-contract';
import {ContractOptions} from '@polkadot/api-contract/types';
import {KeyringPair} from '@polkadot/keyring/types';

import {bootstrapContract, createBlockhainApi, getAccount, getGasLimit, signAndSend, CERE} from './helpers';

describe('Network topology', () => {
    let api: ApiPromise;
    let alice: KeyringPair;
    let contract: ContractPromise;
    let contractOptions: ContractOptions;
    let contractOptionsPay: ContractOptions;

    beforeAll(async () => {
        api = await createBlockhainApi();
        alice = await getAccount('//Alice');
        contract = await bootstrapContract(api, alice);
        contractOptions = {
            value: 0n,
            gasLimit: await getGasLimit(api),
        };

        contractOptionsPay = {...contractOptions, value: 10n * CERE};
    });

    afterAll(async () => {
        await api.disconnect();
    });

    it('should have clusters', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.clusterList(alice.address, contractOptions, offset, limit, filterManagerId);
        const [list, count] = result.output?.toHuman() as [any[], string];

        expect(count).toEqual('0');
        expect(list).toEqual([]);
    });

    it('should have no CDN nodes', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.cdnNodeList(alice.address, contractOptions, offset, limit, filterManagerId);
        const [list, count] = result.output?.toHuman() as [any[], string];

        expect(count).toEqual('0');
        expect(list).toEqual([]);
    });

    it('should have no storage nodes', async () => {
        const offset = 0;
        const limit = 100;
        const filterManagerId = undefined;

        const result = await contract.query.nodeList(alice.address, contractOptions, offset, limit, filterManagerId);
        const [list, count] = result.output?.toHuman() as [any[], string];

        expect(count).toEqual('0');
        expect(list).toEqual([]);
    });

    describe('Cluster management', () => {
        let clusterId: number;

        test('add cluster', async () => {
            const clusterParams = {};
            const resourcePerVNode = 10;

            const createTx = contract.tx.clusterCreate(
                contractOptionsPay,
                JSON.stringify(clusterParams),
                resourcePerVNode,
            );

            const {contractEvents} = await signAndSend(createTx, alice);
            const createdEvent = contractEvents.find(({event}) => event.identifier === 'ClusterCreated');

            clusterId = createdEvent?.args[0].toJSON() as number;
            expect(clusterId).toEqual(0);

            const listResult = await contract.query.clusterList(alice.address, contractOptions, 0, 10, null);
            const [list] = listResult.output?.toHuman() as [any[]];

            expect(list).toEqual([
                expect.objectContaining({
                    clusterId: clusterId.toString(),
                }),
            ]);
        });

        test.todo('add storage node');
        test.todo('remove storage node');
        test('remove storage cluster', async () => {
            const removeTx = contract.tx.clusterRemove(contractOptionsPay, clusterId);
            const {contractEvents} = await signAndSend(removeTx, alice);
            const removedEvent = contractEvents.find(({event}) => event.identifier === 'ClusterRemoved');

            expect(removedEvent).toBeTruthy();
        });
    });

    describe('Storage & CDN topology', () => {
        test.todo('setup network topology');
        it.todo('should list clusters');
        it.todo('should list CDN nodes in a cluster');
        it.todo('should list storage nodes in a cluster');
        it.todo('should react to topology update events');
    });
});
