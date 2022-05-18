const {DockerComposeEnvironment, Wait} = require("testcontainers");
const {composeFilePath, composeFile} = require("./jest.variables");

module.exports = async function (globalConfig) {
    console.log(`Start ${composeFilePath}/${composeFile}`);
    globalThis.__DOCKER_COMPOSE__ = await new DockerComposeEnvironment(composeFilePath, composeFile)
        .withWaitStrategy("ddc-cdn-node", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-0", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-1", Wait.forHealthCheck())
        .withWaitStrategy("ddc-storage-node-2", Wait.forHealthCheck())
        .up();

    console.log(`Docker-compose is UP`);
};
