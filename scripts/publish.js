import {createRequire} from 'node:module';
import path from 'node:path';
import {URL} from 'node:url';
import fs from 'node:fs';
import packages from './packages.js';
import {execSync} from 'node:child_process';

const require = createRequire(import.meta.url);
const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

const packageJson = require(path.join(root, 'package.json'));

delete packageJson.workspaces;
fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2),
);

packages.forEach((packageName) => {
    execSync(`npm install`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    execSync(`npm run package`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    execSync('npm publish --access public', {
        cwd: path.join(root, packageName, 'build'),
        stdio: 'inherit',
    });
});
