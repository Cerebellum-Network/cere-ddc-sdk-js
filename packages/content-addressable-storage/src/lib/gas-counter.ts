export class GasCounter {
    commitId = 1;

    commits = new Map<number, Set<Array<bigint>>>();

    engine = new Set<Array<bigint>>();

    push(gasAmount: number | bigint): void {
        this.engine.add([BigInt(gasAmount)]);
    }

    readUncommitted(): [bigint, number] {
        this.commitId += 1;
        const commit = new Set<Array<bigint>>();
        const gasAmount = Array.from(this.engine.values()).map((gas) => {
            const [value] = gas;
            this.engine.delete(gas);
            commit.add(gas);
            return value;
        }).reduce((a, b) => a + b);
        this.commits.set(this.commitId, commit);
        return [gasAmount, this.commitId];
    }

    commit(commitId: number) {
        this.commits.delete(commitId);
    }

    revert(commitId: number) {
        const commit = this.commits.get(commitId);
        if (commit) {
            commit.forEach(value => {
                this.engine.add(value);
            });
        }
        this.commits.delete(commitId);
    }
}
