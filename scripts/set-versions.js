import {execSync} from 'node:child_process';
import { createRequire } from 'module';
import path from 'node:path';
import fs from 'node:fs';
import packages from './packages.js';

const require = createRequire(import.meta.url);

/**
 * @param {String} root
 * @param {Object} options
 * @param {Boolean} [options.minor]
 * @param {Boolean} [options.major]
 * @param {Boolean} [options.patch]
 * @returns {Object}
 */
export function setVersions(root, options) {
    if (options.minor) {
        execSync(`npm version minor --workspaces`, {
            cwd: root,
            stdio: 'inherit',
        });
    }
    if (options.major) {
        execSync(`npm version major --workspaces`, {
            cwd: root,
            stdio: 'inherit',
        });
    }
    if (options.patch) {
        execSync(`npm version patch --workspaces`, {
            cwd: root,
            stdio: 'inherit',
        });
    }

    const versions = JSON.parse(execSync('npm version --workspaces --json', {cwd: root}).toString());

    packages.forEach((packageName) => {
        const packageInfo = require(path.join(root, packageName, 'package.json'));
        if (packageInfo.dependencies) {
            Object.entries(packageInfo.dependencies ?? {}).forEach(([key]) => {
                if (/@cere-ddc-sdk/.test(key) && versions[key]) {
                    packageInfo.dependencies[key] = versions[key];
                }
            });
            fs.writeFileSync(path.join(root, packageName, 'package.json'), JSON.stringify(packageInfo, null, 2));
        }
    });
}
