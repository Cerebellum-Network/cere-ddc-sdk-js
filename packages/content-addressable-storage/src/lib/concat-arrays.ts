export function concatArrays(...arrays: Uint8Array[]): Uint8Array {
    const size = arrays.reduce((result, array) => result + array.length, 0);
    const result = new Uint8Array(size);
    let i = 0;
    arrays.forEach((array) => {
        result.set(array, i);
        i += array.length;
    });
    return result;
}
