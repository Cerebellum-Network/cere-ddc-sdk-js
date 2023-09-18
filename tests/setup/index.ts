import {startDDC, stopDDC} from './ddc';

export const setup = async () => {
    await startDDC();
};

export const tearDown = async () => {
    await stopDDC();
};
