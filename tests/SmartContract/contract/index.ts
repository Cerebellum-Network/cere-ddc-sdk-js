import * as fs from 'fs/promises';
import * as path from 'path';

export const readContract = async () => {
    const wasm = await fs.readFile(path.resolve(__dirname, 'ddc_bucket.wasm'));
    const metadata = await fs.readFile(path.resolve(__dirname, 'metadata.json'));

    return {
        abi: metadata.toString(),
        wasm: wasm.toString(),
    };
};
