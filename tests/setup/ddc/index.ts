import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';

let environment: StartedDockerComposeEnvironment | undefined;

export const startDDC = async () => {
    console.log('');
    console.log('Starting local DDC environment...');
    environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.yml')
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .withWaitStrategy('ddc-cdn-node-0', Wait.forHealthCheck())
        .withWaitStrategy('ddc-cdn-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-0', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-2', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-3', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-6', Wait.forHealthCheck())
        .up();

    console.log('Local DDC is started');
};

export const stopDDC = async () => {
    console.log('Stopping local DDC environment...');
    await environment?.down();
    console.log('Local DDC is stopped');
};
