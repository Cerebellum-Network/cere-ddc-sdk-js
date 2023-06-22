import {createRequire} from 'node:module';
import path from 'node:path';
import {URL} from 'node:url';
import fs from 'node:fs';
import {execSync} from 'node:child_process';
import packages from './packages.js';
import {delay} from './delay.js';
import {waitForVersion} from './wait-for-version.js';

const require = createRequire(import.meta.url);
const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

const packageJson = require(path.join(root, 'package.json'));
const packageJsonCopy = {};
Object.assign(packageJsonCopy, packageJson);

delete packageJson.workspaces;
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));

execSync(`npm install`, {
    cwd: path.join(root),
    stdio: 'inherit',
});

for (let i = 0; i < packages.length; i += 1) {
    const packageName = packages[i];
    const packageInfo = require(path.join(root, packageName, 'package.json'));
    execSync(`npm install`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    execSync(`npm run package`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    await delay(10_000);

    execSync('npm publish --access public', {
        cwd: path.join(root, packageName, 'package'),
        stdio: 'inherit',
    });
    await waitForVersion(packageInfo.name, packageInfo.version);
    execSync('rm -rf package', {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });
}

fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify(packageJsonCopy, null, 2)}\n`);
