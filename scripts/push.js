import path from 'node:path';
import {URL} from 'node:url';
import {execSync} from 'node:child_process';

export function push(metaUrl) {
    const dirname = path.dirname(new URL(metaUrl).pathname);
    const registry = process.env.REGISTRY;
    console.log('push', {registry});
    if (registry) {
        execSync(`npm publish --registry ${registry}`, {
            cwd: path.join(dirname, "../build"), stdio: "inherit",
        });
    } else {
        execSync('npm publish', {
            cwd: path.join(dirname, '../build'), stdio: 'inherit'
        });
    }
}
