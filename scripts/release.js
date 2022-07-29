import path from 'node:path';
import {URL} from 'node:url';
import commandLine from 'command-line-args';
import {optionsDefinitions} from './options-definitions.js';
import commandLineUsage from 'command-line-usage';
import {setVersions} from './set-versions.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(dirname, '..');

const options = commandLine(optionsDefinitions);
if (Object.keys(options).length === 0 || options.help) {
    console.log(
        commandLineUsage([
            {
                header: 'Release',
                content: 'prepare release new versions'
            },
            {
                header: 'Options',
                optionList: optionsDefinitions,
            },
        ]),
    );
    process.exit();
}

setVersions(root, options);
