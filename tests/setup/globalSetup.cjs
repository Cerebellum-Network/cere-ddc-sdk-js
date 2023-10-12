const {startDDC} = require('./ddc');
const {setupBlockchain} = require('./blockchain');

module.exports = async () => {
    console.log(''); // New line

    await startDDC();
    await setupBlockchain();
};
