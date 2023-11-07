import {startDDC, stopDDC} from './ddc';
import {startBlockchain, stopBlockchain} from './blockchain';

declare global {
    var DDC_CONTRACT_ADDRESS: string;
    var DDC_API_URL: string;
}

export const startEnvironment = async () => {
    console.group('Start local environment');

    const bcEnv = await startBlockchain();
    await startDDC(bcEnv);

    console.groupEnd();
};

export const stopEnvironment = async () => {
    console.group('Stop local environment');

    await stopDDC();
    await stopBlockchain();

    console.groupEnd();
};
