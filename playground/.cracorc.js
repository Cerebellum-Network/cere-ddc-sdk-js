const {addPlugins, getLoader, loaderByName} = require('@craco/craco');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const {NormalModuleReplacementPlugin} = require('webpack');

module.exports = {
    webpack: {
        configure: (config) => {
            addPlugins(config, [new NodePolyfillPlugin()]);

            /**
             * Replace `resolve.plugins` to allow compiling packages outside of `src`
             */
            config.resolve.plugins = [new TsconfigPathsPlugin()];

            /**
             * Let Babel compile outside of `src`
             */
            const {match} = getLoader(config, loaderByName('babel-loader'));

            Object.assign(match.loader, {
                include: undefined,
                exclude: /node_modules/,
            });

            config.resolve.alias = {
                'stream/consumers': require.resolve('stream-consumers'),
                'stream/web': require.resolve('web-streams-polyfill/es2018'),
            };

            config.externals = {
                'node:path': {},
                'node:buffer': {},
            };

            return config;
        },
    },
};
