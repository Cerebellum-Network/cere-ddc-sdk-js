import {DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait} from 'testcontainers';

let environment: StartedDockerComposeEnvironment | undefined;

export const startDDC = async () => {
    console.group('Start DDC');

    console.log('Starting the environment...');
    environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.yml')
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .withWaitStrategy('ddc-cdn-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-cdn-node-2', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-d43593c7', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-8eaf0415', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-90b5ab20', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-e659a7a1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-1cbd2d43', Wait.forHealthCheck())
        .up();

    console.log('The environment has started!');

    console.groupEnd();
};

export const stopDDC = async () => {
    console.group('Stop DDC');

    console.log('Stopping the environment...');
    await environment?.down();
    console.log('The environment has stopped!');

    console.groupEnd();
};
