const {DockerComposeEnvironment, Wait} = require("testcontainers");
const {composeFilePath, composeFile} = require("./jest.variables.cjs");
const path = require('node:path');
const { execSync } = require('node:child_process');

module.exports = async function (globalConfig, projectConfig) {
    const packages = (await import('./scripts/packages.js')).default;
    packages.forEach(packageName => {
        const buildFolder = path.join(__dirname, packageName, 'build');
        execSync(`rm -rf ${buildFolder}`, {
            stdio: 'inherit',
            cwd: __dirname,
        });
    });
    console.log(`Start ${composeFilePath}/${composeFile}`);
    globalThis.__DOCKER_COMPOSE__ = await new DockerComposeEnvironment(composeFilePath, composeFile)
        .withWaitStrategy("ddc-cdn-node", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-0", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-1", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-2", Wait.forHealthCheck())
        .up();

    console.log(`Docker-compose is UP`);
};
