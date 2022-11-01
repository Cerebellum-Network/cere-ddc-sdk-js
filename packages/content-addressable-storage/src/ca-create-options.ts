import {StorageOptionsInterface} from './StorageOptions';

export type CaCreateOptions = StorageOptionsInterface & {
    readAttempts: number;
}
