import path from "node:path";
import {URL} from "node:url";
import {merge} from "webpack-merge";
import webpack from 'webpack';
import {createRequire} from "module";

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
    const nodeModules = path.join(dirname, 'node_modules');

    const require = createRequire(import.meta.url);
    const packageJson = require(path.join(dirname, 'package.json'));
    const externals = Object.keys(packageJson.dependencies ?? {}).reduce((acc, key) => {
        acc[key] = key;
        return acc;
    }, {});

    const config = {
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
        },
        output: {
            iife: false,
            library: {
                type: "module",
            },
            filename: "[name].js",
        },
        externals,
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            })
        ],
    };


    let webpackConfig = merge(config, {
        output: {
            path: path.join(dirname, "build"),
        },
    });
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

    if (browserslistEnv === "browser") {
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
