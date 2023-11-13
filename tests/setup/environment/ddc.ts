import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';
import type {Blockchain} from './blockchain';
import {getHostIP} from '../../helpers';

let environment: StartedDockerComposeEnvironment | undefined;

const uuid = {nextUuid: () => 'ddc'};
export const startDDC = async (bc: Blockchain) => {
    console.group('DDC');

    const environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.ddc.yml', uuid)
        .withEnv('BLOCKCHAIN_API_URL', bc.apiUrl)
        .withEnv('BLOCKCHAIN_DDC_BUCKET_CONTRACT', bc.contractAddress)
        .withEnv('CLUSTER_ID', bc.clusterId.toString())
        .withEnv('HOST_IP', getHostIP())
        // .withWaitStrategy('ddc-cdn-node-0', Wait.forHealthCheck())
        // .withWaitStrategy('ddc-cdn-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-2', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-3', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-4', Wait.forHealthCheck())
        .up();

    console.log('The environment has started!');
    console.groupEnd();
};

export const stopDDC = async () => {
    await environment?.down();

    console.log('DDC');
};
