const isNumberTuple = (val: unknown): val is [number] => {
    return Array.isArray(val) && Number.isFinite(val[0]);
};

export function randomUint8(max: number): number {
    const floor = Math.pow(2, Math.ceil(Math.log2(max)));
    const src = new Uint8Array(8);
    let target: number[] = [];
    while (!isNumberTuple(target)) {
        crypto.getRandomValues(src);
        target = Array.from(src).map(Number).map(v => v % floor).filter(v => v < max);
    }
    return target[0];
}
