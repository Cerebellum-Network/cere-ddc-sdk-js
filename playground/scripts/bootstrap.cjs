const {startEnvironment} = require('../../tests');

const main = async () => {
    await startEnvironment();

    process.stdin.resume();
};

const stop = async () => {
    process.exit();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

main();
