import path from 'node:path';
import {URL} from 'node:url';
import {merge} from 'webpack-merge';
import webpack from 'webpack';
import {createRequire} from 'module';

const target = process.env.TARGET;
const browserslistEnv = process.env.BROWSERSLIST_ENV;

/**
 * @param {string} metaUrl
 * @param {string} nodeEntry
 * @param {string} [browserEntry]
 * @param {string} [browserEntryName]
 */
export function createConfig(metaUrl, nodeEntry, browserEntry, browserEntryName, typesEntry) {
    const dirname = path.dirname(new URL(metaUrl).pathname);
    const folderName = path.basename(dirname);
    const nodeModules = path.join(dirname, 'node_modules');

    const require = createRequire(import.meta.url);
    const packageJson = require(path.join(dirname, 'package.json'));
    const externals = Object.keys(packageJson.dependencies ?? {}).reduce((acc, key) => {
        acc[key] = key;
        return acc;
    }, {});

    const isBrowserModule = process.env.npm_lifecycle_event === 'build:browser:module';
    let webpackConfig = {
        mode: process.env.NODE_ENV || 'production',
        target: 'browserslist',
        entry: typesEntry && {
            types: path.resolve(dirname, typesEntry),
        },
        experiments: {
            asyncWebAssembly: true,
            outputModule: true,
            topLevelAwait: true,
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'babel-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.?js$/,
                    use: 'babel-loader',
                    include: [path.join(nodeModules, 'buffer')],
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            iife: false,
            library: {
                type: 'module',
            },
            filename: '[name].js',
            path: path.join(dirname, 'dist'),
        },
        externals: isBrowserModule ? {} : externals,
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    };

    if (browserslistEnv === 'node') {
        webpackConfig = merge(webpackConfig, {
            entry: {
                [path.basename(nodeEntry).split('.').shift()]: path.resolve(dirname, nodeEntry),
            },
        });
    }

    if (browserslistEnv === 'node') {
        webpackConfig = merge(webpackConfig, {
            optimization: {
                minimize: false,
            },
            plugins: [
                new webpack.ProvidePlugin({
                    crypto: ['node:crypto', 'webcrypto'],
                    URL: ['node:url', 'URL'],
                    URLSearchParams: ['node:url', 'URLSearchParams'],
                }),
            ],
        });
    }

    if (isBrowserModule) {
        webpackConfig = merge(webpackConfig, {
            entry: {
                [folderName]: path.resolve(dirname, browserEntry || nodeEntry),
            },
        });
    } else if (browserslistEnv === 'browser') {
        webpackConfig = merge(webpackConfig, {
            target: 'web', // TODO: Figure out how to use `browserslist` target here
            entry: {
                [browserEntryName ||
                path
                    .basename(browserEntry || nodeEntry)
                    .split('.')
                    .shift()]: path.resolve(dirname, browserEntry || nodeEntry),
            },
        });
    }

    if (target === 'build:cjs') {
        webpackConfig = merge(webpackConfig, {
            experiments: {
                asyncWebAssembly: false,
                outputModule: false,
                topLevelAwait: false,
            },
            output: {
                library: {
                    type: 'commonjs',
                },
                filename: '[name].cjs',
            },
        });
    }

    return webpackConfig;
}
