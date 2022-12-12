import { TasksRunner } from '../packages/content-addressable-storage/src/lib/tasks-runner';
import {delay} from './delay';

describe('packages/content-addressable-storage/src/lib/tasks-runner.ts', () => {
    let taskRunner: TasksRunner;

    beforeEach(() => {
        taskRunner = new TasksRunner(50);
    });

    it('should run task once within the period', async () => {
        const fn = jest.fn();
        const fn2 = jest.fn();
        taskRunner.addTask(fn);
        taskRunner.addTask(fn);

        await delay(10);
        taskRunner.addTask(fn2);
        taskRunner.addTask(fn2);
        expect(fn).not.toBeCalled();

        await delay(51);
        expect(fn).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(1);
    });

    it('should prevent task running after reset', async () => {
        const fn = jest.fn();
        const fn2 = jest.fn();
        taskRunner.addTask(fn);
        taskRunner.addTask(fn2);

        await delay(10);
        taskRunner.reset();

        await delay(51);
        expect(fn).not.toBeCalled();
        expect(fn2).not.toBeCalled();
    });

    it('should run scheduled task with latest arguments', async () => {
        const fn = jest.fn();
        taskRunner.addTask(fn, 1);

        await delay(10);
        taskRunner.addTask(fn, 2);

        await delay(41);
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(2);

    });
});
