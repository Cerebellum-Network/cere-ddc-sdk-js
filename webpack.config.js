const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => {
    return {
        watch: false,
        entry: {
            main: './packages/index.ts',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'cere-ddc-sdk.js',
            library: ['CereDdcSDK'],
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
    };
};