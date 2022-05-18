const {composeFilePath, composeFile} = require("./jest.variables");

module.exports = async function (globalConfig) {
    console.log(`Stop ${composeFilePath}/${composeFile}`);
    await globalThis.__DOCKER_COMPOSE__.down();
    console.log(`Docker-compose is DOWN`);
};
