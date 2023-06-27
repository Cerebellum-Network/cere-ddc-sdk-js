import {StorageOptionsInterface} from './StorageOptions';

export type Session = Uint8Array;

export type CaCreateOptions = StorageOptionsInterface & {
    readAttempts: number;
    writeAttempts: number;
    ackTimeout?: number;
    session?: Session;
};
