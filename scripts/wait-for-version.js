import {execSync} from 'node:child_process';
import {delay} from './delay.js';

/**
 * @param {string} packageName
 * @param {string} packageVersion
 * @param {number} [attempts]
 * @return {Promise<boolean>}
 */
export async function waitForVersion(packageName, packageVersion, attempts = 10) {
    const packageInfo = JSON.parse(execSync(`npm info ${packageName} --json`).toString('utf-8'));
    const latest = packageInfo['dist-tags'].latest;
    if (latest === packageVersion) {
        return true;
    }
    if (attempts === 0) {
        throw Error(`'The required version ${packageName}@${packageVersion} isn't found in the npm registry'`);
    }
    await delay(100);
    return waitForVersion(packageName, packageVersion, attempts - 1);
}
