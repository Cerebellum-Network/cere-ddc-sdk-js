require('tsconfig-paths').register();

const {startEnvironment} = require('./environment');

module.exports = async () => {
    console.log(''); // New line

    /**
     * Emulate browser environment
     */
    globalThis.self = globalThis;
    globalThis.WebSocket = require('ws').WebSocket;

    await startEnvironment();
};
