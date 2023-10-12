import {SmartContract} from '@cere-ddc-sdk/smart-contract';
import {bootstrapContract, createBlockhainApi, getAccount} from '../../helpers';

export const setupBlockchain = async () => {
    console.group('Setup blockchain');

    const api = await createBlockhainApi();
    const admin = await getAccount('//Alice');

    console.log('Deploying contract...');
    const deployedContract = await bootstrapContract(api, admin);
    console.log('Contract address', deployedContract.address.toHex());

    const contract = new SmartContract(admin, deployedContract);
    const clusterId = await contract.clusterCreate({replicationFactor: 1}, 100000n);
    console.log('Cluster ID', clusterId);

    await api.disconnect();

    console.groupEnd();
};
