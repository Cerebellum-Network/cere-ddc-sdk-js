import path from 'node:path';
import {URL} from 'node:url';
import {merge} from 'webpack-merge';
import webpack from 'webpack';
import {createRequire} from 'node:module';

const target = process.env.TARGET;
const browserslistEnv = process.env.BROWSERSLIST_ENV;

/**
 * @param {string} metaUrl
 * @param {string} nodeEntry
 * @param {string} [browserEntry]
 * @param {string} [browserEntryName]
 */
export function createConfig(
    metaUrl,
    nodeEntry,
    browserEntry,
    browserEntryName
) {
    const dirname = path.dirname(new URL(metaUrl).pathname);
    const root = path.dirname(new URL(import.meta.url).pathname);
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
                    use: "babel-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.?js$/,
                    use: "babel-loader",
                    include: [path.join(nodeModules, 'buffer')],
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                '@cere-ddc-sdk/content-addressable-storage': path.join(root, 'packages/content-addressable-storage/src/index.ts'),
                '@cere-ddc-sdk/core/browser': path.join(root, 'packages/core/src/browser.ts'),
                '@cere-ddc-sdk/core': path.join(root, 'packages/core/src/index.ts'),
                '@cere-ddc-sdk/ddc-client': path.join(root, 'packages/ddc-client/src/index.ts'),
                '@cere-ddc-sdk/file-storage/browser': path.join(root, 'packages/file-storage/src/browser.ts'),
                '@cere-ddc-sdk/file-storage': path.join(root, 'packages/file-storage/src/index.ts'),
                '@cere-ddc-sdk/key-value-storage': path.join(root, 'packages/key-value-storage/src/index.ts'),
                '@cere-ddc-sdk/proto': path.join(root, 'packages/proto/src/index.ts'),
                '@cere-ddc-sdk/smart-contract/browser': path.join(root, 'packages/smart-contract/src/browser.ts'),
                '@cere-ddc-sdk/smart-contract': path.join(root, 'packages/smart-contract/src/index.ts'),
            }
        },
        output: {
            iife: false,
            library: {
                type: "module",
            },
            filename: "[name].js",
            path: path.join(dirname, "build"),
        },
        externals: isBrowserModule ? {} : externals,
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
    };

    if (browserslistEnv === "node") {
        webpackConfig = merge(webpackConfig, {
            entry: {
                [path.basename(nodeEntry).split(".").shift()]: path.resolve(
                    dirname,
                    nodeEntry
                ),
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
                    'crypto': ['node:crypto', 'webcrypto'],
                    'URL': ['node:url', 'URL'],
                    'URLSearchParams': ['node:url', 'URLSearchParams'],
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
    } else if (browserslistEnv === "browser") {
        webpackConfig = merge(webpackConfig, {
            entry: {
                [browserEntryName ||
                path
                    .basename(browserEntry || nodeEntry)
                    .split(".")
                    .shift()]: path.resolve(dirname, browserEntry || nodeEntry),
            },
        });
    }

    if (target === "build:cjs") {
        webpackConfig = merge(webpackConfig, {
            experiments: {
                asyncWebAssembly: false,
                outputModule: false,
                topLevelAwait: false,
            },
            output: {
                library: {
                    type: "commonjs",
                },
                filename: "[name].cjs",
            },
        });
    }

    return webpackConfig;
}
