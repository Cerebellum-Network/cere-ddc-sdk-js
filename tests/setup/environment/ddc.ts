import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
import type { BlockchainConfig } from './blockchain';
import { getHostIP, STORAGE_NODE_MAX_STARTUP_TIME } from '../../helpers';

let environment: StartedDockerComposeEnvironment | undefined;

const uuid = { nextUuid: () => 'ddc' };
const waitStrategy = () =>
  Wait.forLogMessage(/Start GRPC server on port \d+/).withStartupTimeout(STORAGE_NODE_MAX_STARTUP_TIME);

export const startDDC = async (bc: BlockchainConfig) => {
  console.group('DDC');

  const blockchainUrl = new URL(bc.apiUrl);

  blockchainUrl.hostname = getHostIP();
  environment = await new DockerComposeEnvironment(__dirname, 'docker-compose.ddc.yml', uuid)
    .withEnvironment({
      BLOCKCHAIN_URL: blockchainUrl.href,
      CLUSTER_ID: bc.clusterId,
      HOST_IP: blockchainUrl.hostname,
    })
    .withWaitStrategy('ddc-storage-node-1', waitStrategy())
    .withWaitStrategy('ddc-storage-node-2', waitStrategy())
    .withWaitStrategy('ddc-storage-node-3', waitStrategy())
    .withWaitStrategy('ddc-storage-node-4', waitStrategy())
    .withWaitStrategy('ddc-storage-node-5', waitStrategy())
    .up();

  console.log('The environment has started!');
  console.groupEnd();
};

export const stopDDC = async () => {
  await environment?.down();

  console.log('DDC');
};
