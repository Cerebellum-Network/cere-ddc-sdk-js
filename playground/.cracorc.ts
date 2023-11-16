import {Configuration, DefinePlugin} from 'webpack';
import {addPlugins} from '@craco/craco';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

import {getEnvironment} from '../tests';

export default {
    webpack: {
        configure: (config: Configuration) => {
            config.resolve ||= {};
            config.resolve.plugins = [];

            addPlugins(config, [new NodePolyfillPlugin()]);

            try {
                const env = getEnvironment();

                addPlugins(config, [
                    new DefinePlugin({
                        'process.env.BC_ENDPOINT': JSON.stringify(env.rpcUrl),
                    }),
                ]);
            } catch {}

            return config;
        },
    },
};
