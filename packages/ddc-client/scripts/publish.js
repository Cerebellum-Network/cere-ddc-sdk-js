import { execSync } from 'node:child_process';
import { URL } from 'node:url';
import path from 'node:path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

execSync('npm publish', {
  cwd: path.join(dirname, '../build'),
  stdio: 'inherit'
});
