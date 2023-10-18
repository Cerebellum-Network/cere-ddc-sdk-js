const {startEnvironment} = require('./environment');

module.exports = async () => {
    console.log(''); // New line

    await startEnvironment();
};
