# Cere DDC SDK for JavaScript/TypeScript

The DDC SDK is a development kit used by developers to create applications that interact with the CERE infrastructure. It provides a set of modules and methods that allow seamless integration with the Cerebellum Network's decentralized data cloud (DDC).

## Packages

- [@cere-ddc-sdk/ddc-client](packages/ddc-client/README.md) - The main DDC SDK interface with all methods for working with DDC
- [@cere-ddc-sdk/blockchain](packages/blockchain/README.md) - Work directly with the Cere blockchain
- [@cere-ddc-sdk/file-storage](packages/file-storage/README.md) - Upload large files, using chunk streaming
- [@cere-ddc-sdk/ddc](packages/ddc/README.md) - Low level package to directly communicate with DDC nodes

## Demo

The playground app is small demo application you can try how DDC SDK works in browser.

- [Source code](playground)
- [Online demo](https://cerebellum-network.github.io/cere-ddc-sdk-js/)

## Quick start

1. Prepare Node.JS version

   ```
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm i
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
