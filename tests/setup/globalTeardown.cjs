require('tsconfig-paths').register();

const {stopEnvironment} = require('./environment');

module.exports = async () => {
    await stopEnvironment();
};
