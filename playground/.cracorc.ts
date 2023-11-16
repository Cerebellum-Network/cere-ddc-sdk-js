import {Configuration, DefinePlugin} from 'webpack';
import {addPlugins, getLoader, loaderByName} from '@craco/craco';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

import {getEnvironment} from '../tests';

export default {
    webpack: {
        configure: (config: Configuration) => {
            try {
                const env = getEnvironment();

                addPlugins(config, [
                    new DefinePlugin({
                        'process.env.BC_ENDPOINT': JSON.stringify(env.rpcUrl),
                    }),
                ]);
            } catch {}

            addPlugins(config, [new NodePolyfillPlugin()]);

            config.resolve ||= {};

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
