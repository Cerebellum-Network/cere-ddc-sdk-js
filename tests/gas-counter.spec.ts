import { GasCounter } from '../packages/content-addressable-storage/src/lib/gas-counter';
import {delay} from './delay';

describe('packages/content-addressable-storage/src/lib/gas-counter.ts', () => {
    let gasCounter: GasCounter;

    beforeEach(() => {
        gasCounter = new GasCounter();
    });

    it('should commit gas amount and counts overall amount', () => {
        gasCounter.push(1);
        gasCounter.push(2);
        gasCounter.push(3);
        const [counter] = gasCounter.readUncommitted()
        expect(counter).toBe(6n);

        gasCounter.push(10);
        const [counter2] = gasCounter.readUncommitted()
        expect(counter2).toBe(10n);
    });

    it('should not count same items twice', () => {
        expect.assertions(2);
        Promise.resolve().then(() => {
            gasCounter.push(11);
            const [counter] = gasCounter.readUncommitted();
            expect(counter).toBe(11n);
        });
        Promise.resolve().then(() => {
            gasCounter.push(13);
            const [counter] = gasCounter.readUncommitted();
            expect(counter).toBe(13n);
        });
    });

    it('should apply commits', async () => {
        gasCounter.push(1);
        gasCounter.push(2);
        gasCounter.push(3);

        await delay(51);
        const [counter, commitId] = gasCounter.readUncommitted();
        expect(counter).toBe(6n);

        gasCounter.push(4);
        gasCounter.commit(commitId);

        await delay(51);
        const [counter2] = gasCounter.readUncommitted();
        expect(counter2).toBe(4n)
    });

    it('should apply resets', async () => {
        gasCounter.push(1);
        gasCounter.push(2);
        gasCounter.push(3);

        await delay(51);
        const [counter, commitId] = gasCounter.readUncommitted();
        expect(counter).toBe(6n);

        gasCounter.push(4);
        gasCounter.revert(commitId);

        await delay(51);
        const [counter2] = gasCounter.readUncommitted();
        expect(counter2).toBe(10n)
    });
});
