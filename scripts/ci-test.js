import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {URL} from 'node:url';
import commandLine from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import packages from './packages.js';
import { setVersions } from './set-versions.js';

const optionDefinitions = [
    {
        name: 'patch',
        type: Boolean,
        description: 'Increase patch and publish',
        typeLabel: ' ',
    },
    {
        name: 'major',
        type: Boolean,
        description: 'Increase major and publish',
        typeLabel: ' ',
    },
    {
        name: 'minor',
        type: Boolean,
        description: 'Increase minor and publish',
        typeLabel: ' ',
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display this help',
        typeLabel: ' ',
    },
];

const options = commandLine(optionDefinitions);

const require = createRequire(import.meta.url);
const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

if (Object.keys(options).length === 0 || options.help) {
    console.log(
        commandLineUsage([
            {
                header: 'Options',
                optionList: optionDefinitions,
            },
        ]),
    );
    process.exit();
}

setVersions(root, options);

const packageJson = require(path.join(root, 'package.json'));

delete packageJson.workspaces;
fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2),
);

packages.forEach((packageName) => {
    const packageInfo = require(path.join(root, packageName, 'package.json'));

    if (packageInfo.dependencies) {
        const ddcDeps = [];
        Object.entries(packageInfo.dependencies ?? {}).forEach(([key]) => {
            if (/@cere-ddc-sdk/.test(key)) {
                delete packageInfo.dependencies[key];
                ddcDeps.push(key);

            }
        });
        fs.writeFileSync(path.join(root, packageName, 'package.json'), JSON.stringify(packageInfo, null, 2));
        ddcDeps.forEach(ddcPackage => {
            execSync(
                `npm link ${ddcPackage} --save`,
                { cwd: path.join(root, packageName), stdio: 'inherit' }
            )
        });
    }

    execSync(`npm install`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    execSync(`npm run package`, {
        cwd: path.join(root, packageName),
        stdio: 'inherit',
    });

    execSync('npm link', {
        cwd: path.join(root, packageName, 'build'),
        stdio: 'inherit',
    });
});
