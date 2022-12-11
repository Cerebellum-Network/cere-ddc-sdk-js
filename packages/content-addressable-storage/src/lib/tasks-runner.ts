type Fn = (...args: any[]) => unknown;

export class TasksRunner {
    private queue = new Map<Fn, Array<unknown>>();

    private timeouts = new Set<number | NodeJS.Timeout>();

    constructor(private readonly timeout: number) {}

    addTask(task: Fn, ...args: unknown[]) {
        if (!this.queue.has(task)) {
            this.runTask(task);
        }
        this.queue.set(task, args);
    }

    reset() {
        this.queue.clear();
        Array.from(this.timeouts.values()).forEach(timeout => {
            clearTimeout(timeout);
        });
        this.timeouts.clear();
    }

    private runTask(task: Fn) {
        const timeout = setTimeout(() => {
            const args = this.queue.get(task) ?? [];
            try {
                task(...args);
                this.queue.delete(task);
            } catch (e) {
                this.runTask(task);
            }
        }, this.timeout);
        this.timeouts.add(timeout);
    }
}
