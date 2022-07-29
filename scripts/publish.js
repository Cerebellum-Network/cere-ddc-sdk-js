import {createRequire} from 'node:module';
import {execSync, fork} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {URL} from 'node:url';
import commandLine from 'command-line-args';
import commandLineUsage from 'command-line-usage';

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

const packageJson = require(path.join(root, 'package.json'));

delete packageJson.workspaces;
fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2),
);

[
    'packages/smart-contract',
    'packages/proto',
    'packages/core',
    'packages/content-addressable-storage',
    'packages/file-storage',
    'packages/key-value-storage',
    'packages/ddc-client',
].forEach((packageName) => {
    const packageInfo = require(path.join(root, packageName, 'package.json'));
    console.log({packageName});
    if (packageInfo.dependencies) {
        Object.entries(packageInfo.dependencies ?? {}).forEach(([key]) => {
            if (/@cere-ddc-sdk/.test(key)) {
                execSync(
                    `npm link ${key} --save`,
                    { cwd: path.join(root, packageName), stdio: 'inherit' }
                )
            }
        });
        fs.writeFileSync(path.join(root, packageName, 'package.json'), JSON.stringify(packageInfo, null, 2));
    }

    execSync(`rm -f package-lock.json`, {
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
