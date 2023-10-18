const {stopEnvironment} = require('./environment');

module.exports = async () => {
    await stopEnvironment();
};
