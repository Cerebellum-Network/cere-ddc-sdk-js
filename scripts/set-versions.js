import {execSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

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
    const lockFile = path.join(root, 'package-lock.json');
    if (fs.existsSync(lockFile)) {
        fs.rmSync(lockFile);
    }
}
