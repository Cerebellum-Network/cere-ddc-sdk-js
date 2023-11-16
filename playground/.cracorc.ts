import {Configuration, DefinePlugin} from 'webpack';
import {addPlugins} from '@craco/craco';

import {getEnvironment} from '../tests';

export default {
    webpack: {
        configure: (config: Configuration) => {
            config.resolve ||= {};
            config.resolve.fallback = {
                crypto: 'crypto-browserify',
            };

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
