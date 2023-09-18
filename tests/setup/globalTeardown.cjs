const {stopDDC} = require('./ddc');

module.exports = async () => {
    await stopDDC();
};
