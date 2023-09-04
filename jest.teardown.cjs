const {composeFilePath, composeFile} = require('./jest.variables');

//ToDo doesn't execute after tests
module.exports = async function (globalConfig, projectConfig) {
    console.log(`Stop ${composeFilePath}/${composeFile}`);

    await globalThis.__DOCKER_COMPOSE__.down();

    console.log(`Docker-compose is DOWN`);
};
