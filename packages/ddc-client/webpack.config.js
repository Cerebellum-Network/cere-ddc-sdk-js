import {createConfig} from "../../shared.config.js";
import {merge} from "webpack-merge";
import {createRequire} from "module";
import path from 'node:path';
import {URL} from 'node:url';

const require = createRequire(import.meta.url);
const dirname = path.dirname(new URL(import.meta.url).pathname);
const browserslistEnv = process.env.BROWSERSLIST_ENV;

let config = createConfig(
    import.meta.url,
    "./src/index.ts",
    "./src/browser.ts",
);

if (browserslistEnv === 'browser') {
    config = merge(config, {
        resolve: {
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
            },
            alias: {
                '@cere-ddc-sdk/file-storage': path.join(dirname, '..', 'file-storage/src/browser.ts')
            }
        }
    });
}

export default config;
