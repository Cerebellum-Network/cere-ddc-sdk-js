const {DockerComposeEnvironment, Wait} = require('testcontainers');
const {webcrypto} = require('node:crypto');
const {composeFilePath, composeFile} = require('./jest.variables.cjs');
const path = require('node:path');
const {execSync} = require('node:child_process');

module.exports = async function (globalConfig, projectConfig) {
    const packages = (await import('./scripts/packages.js')).default;

    packages.forEach((packageName) => {
        const packagePublishFolder = path.join(__dirname, packageName, 'package');
        execSync(`rm -rf ${packagePublishFolder}`, {
            stdio: 'inherit',
            cwd: __dirname,
        });
    });

    global.crypto = webcrypto;
    console.log(`Start ${composeFilePath}/${composeFile}`);
    globalThis.__DOCKER_COMPOSE__ = await new DockerComposeEnvironment(composeFilePath, composeFile)
        .withWaitStrategy('cere-chain', Wait.forLogMessage(/Running JSON-RPC WS server/gi))
        .withWaitStrategy('ddc-cdn-node', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-0', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-1', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-2', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-3', Wait.forHealthCheck())
        .withWaitStrategy('ddc-storage-node-6', Wait.forHealthCheck())
        .up();

    console.log(`Docker-compose is UP`);
};
