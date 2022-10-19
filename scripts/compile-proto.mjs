import {execSync} from 'node:child_process';
import path from 'node:path';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

execSync('npm run protoc', {
    cwd: path.join(root, 'packages/proto'),
    stdio: 'inherit',
});
