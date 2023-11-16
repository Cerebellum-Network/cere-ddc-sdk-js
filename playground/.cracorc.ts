import {Configuration, DefinePlugin} from 'webpack';
import NodePolyfill from 'node-polyfill-webpack-plugin';
import {addPlugins} from '@craco/craco';

import {BLOCKCHAIN_RPC_URL} from '../tests';

export default {
    webpack: {
        configure: (config: Configuration) => {
            config.resolve ||= {};
            config.resolve.plugins = [];

            addPlugins(config, [
                new NodePolyfill(),
                new DefinePlugin({
                    'process.env.BC_ENDPOINT': JSON.stringify(BLOCKCHAIN_RPC_URL),
                }),
            ]);

            return config;
        },
    },
};
