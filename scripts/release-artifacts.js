import path from 'node:path';
import {URL} from 'node:url';
import {execSync} from 'node:child_process';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

execSync('npm run build:browser:module', {
    stdio: 'inherit',
    cwd: path.join(root, 'packages', 'content-addressable-storage'),
});

execSync('npm run build:browser:module', {
    stdio: 'inherit',
    cwd: path.join(root, 'packages', 'ddc-client'),
});
