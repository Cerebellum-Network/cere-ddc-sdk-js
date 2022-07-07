import { createConfig } from "../../shared.config.js";
import { merge } from "webpack-merge";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const browserslistEnv = process.env.BROWSERSLIST_ENV;

let config = createConfig(
  import.meta.url,
  "./src/index.ts",
  "./src/index.ts",
  "browser"
);

if (browserslistEnv === 'browser') {
    config = merge(config, {
        resolve: {
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
            }
        }
    });
}

config = merge(config, {
    externals: {
        "@cere-ddc-sdk/core": "@cere-ddc-sdk/core",
        "@cere-ddc-sdk/proto": "@cere-ddc-sdk/proto",
        "@cere-ddc-sdk/smart-contract": "@cere-ddc-sdk/smart-contract"
    }
});

export default config;
