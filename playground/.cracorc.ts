import {DefinePlugin} from 'webpack';
import NodePolyfill from 'node-polyfill-webpack-plugin';

import {BLOCKCHAIN_RPC_URL} from '../tests';

export default {
    webpack: {
        plugins: {
            add: [
                new NodePolyfill(),
                new DefinePlugin({
                    'process.env.BC_ENDPOINT': BLOCKCHAIN_RPC_URL,
                }),
            ],
        },
    },
};
