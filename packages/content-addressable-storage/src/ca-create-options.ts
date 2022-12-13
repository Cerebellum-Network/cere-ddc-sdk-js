import {StorageOptionsInterface} from './StorageOptions';
import {Tier} from './models/Tier';

export type CaCreateOptions = StorageOptionsInterface & {
    readAttempts: number;
    ackTimeout?: number;
    tier?: Tier | undefined;
}
