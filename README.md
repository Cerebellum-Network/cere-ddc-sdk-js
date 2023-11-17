# Cere DDC SDK for JavaScript/TypeScript

The DDC SDK is a development kit used by developers to create applications that interact with the CERE infrastructure. It provides a set of modules and methods that allow seamless integration with the Cerebellum Network's decentralized data cloud (DDC).

## Packages

-   [@cere-ddc-sdk/ddc-client](packages/ddc-client/README.md) - The main DDC SDK interface with all methods for working with DDC
-   [@cere-ddc-sdk/blockchain](packages/blockchain/README.md) - Work directly with the Cere blockchain
-   [@cere-ddc-sdk/file-storage](packages/file-storage/README.md) - Upload large files, using chunk streaming
-   [@cere-ddc-sdk/ddc](packages/ddc/README.md) - Low level package to directly communicate with DDC nodes

## Demo

The playground app is small demo application you can try how DDC SDK works in browser.

-   [Source code](playground)
-   [Online demo](https://cerebellum-network.github.io/cere-ddc-sdk-js/)

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

## Tests

1. Run tests from source code

    ```bash
    npm test
    ```

    On the first run it will take some time to prepare the local testing environment

2. Run tests on pre-built packages or `CI`

    ```bash
    npm run test:ci
    ```

3. Clean local test environment cache
    ```
    npm run test:clean
    ```

## Publish

1. Create a release

    ```
    npm run release
    ```

2. Publish the packages using [Publish GitHub Action](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/actions/workflows/publish.yaml)

3. Deploy Playground using [Deploy playground GitHub Action](https://github.com/Cerebellum-Network/cere-ddc-sdk-js/actions/workflows/playground.yaml)
