# Cere DDC SDK for JavaScript/TypeScript

The DDC SDK is a development kit used by developers to create applications that interact with the CERE infrastructure. It provides a set of modules and methods that allow seamless integration with the Cerebellum Network's decentralized data cloud (DDC).

## Architecture diagram

![architecture diagram](/docs/acrhitecture_diagram.png)

The SDK provides several modules. The DDC Client module acts as an entry point and offers a concise API for straightforward use cases, like creating a bucket or uploading/downloading a file. Additional modules present more advanced APIs that provide enough flexibility for other SDKs to be built on top of the DDC SDK.

## Packages

- [@cere-ddc-sdk/ddc-client](packages/ddc-client/README.md) - The main DDC SDK interface with all methods for working with DDC
- [@cere-ddc-sdk/blockchain](packages/blockchain/README.md) - Work directly with the Cere blockchain
- [@cere-ddc-sdk/file-storage](packages/file-storage/README.md) - Upload large files, using chunk streaming
- [@cere-ddc-sdk/ddc](packages/ddc/README.md) - Low level package to directly communicate with DDC nodes
- [@cere-ddc-sdk/cli](packages/cli/README.md) - DDC Command Line Interface

## Playground

The playground is a simple demo application that you can use during development or try how DDC SDK works in browser. Check Quick Start section below to find out how to run the playground.

- [Source code](playground)
- [Online demo](https://cerebellum-network.github.io/cere-ddc-sdk-js/)

## Quick start

1. Prepare Node.JS version

   ```console
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm i
   ```

   On GNU/Linux you may also need to add executables path:

   ```console
   export PATH=$PWD/node_modules/.bin:$PATH
   ```

3. Build all packages and Playground app:

   ```bash
   npm run build
   ```

4. Run playground application:

   ```bash
   npm run playground
   ```
   Out of the box the playground app can connect to DDC `Devnet` and `Testnet`. To connect it to local environment, the environment [should be started](#local-environment) in a separate terminal.

5. Check [examples](/examples)

## Tests

Run tests

```bash
npm test
```

On the first run it will take some time to prepare the local testing environment

### Local environment

It is possibly to run DDC infrastructure on local machine:
```bash
npm run test:env
```

This command will use [Docker](https://www.docker.com/) to start Cere Blockchain node and several DDC nodes (CDN and storage). The environment is started each time before tests execution and stopped after it.

> There is can only be one instance of local environment running at the same time.

## Documentation

The main source of documentation for all SDK packages is the source code doc comments, which are in the [tsdoc](https://tsdoc.org/) format. If you have changed or added new doc comments, run the following command to regenerate the READMEs.

```bash
npm run docs
```

## Examples

Most commonly used scenarios are present in [examples](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/tree/main/examples) directory. Please, extend it in case you add any significant feature. 

## Publish

1. Create a release

   ```
   npm run release
   ```
   It will detect the next version (based on [Conventional Commits](https://www.conventionalcommits.org/) history), update `CHANGELOG.md`s, create release tag, commit and push changes to the current branch.

   To create an unstable release (`-rc.*`):
   ```
   npm run release:rc
   ```

2. Publish the packages using [Publish GitHub Action](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/actions/workflows/publish.yaml)

3. Deploy Playground using [Deploy playground GitHub Action](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/actions/workflows/playground.yaml)
