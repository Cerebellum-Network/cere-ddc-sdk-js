# @cere-ddc-sdk/cli

DDC CLI provides a flexible set of commands for developers to help setting up a DDC account, upload/download files and more. 

## System requirements

- NodeJS >= 18.0.0

# Installation

Global installation:

```bash
npm install -g @cere-ddc-sdk/cli
```

As a project dependency

```bash
npm install --save-dev @cere-ddc-sdk/cli
```

Running with [NPX](https://www.npmjs.com/package/npx) will auto-install the package

```bash
npx @cere-ddc-sdk/cli [command] [options]
```

# Usage

All interactions with DDC CLI are of the form

```bash
npx @cere-ddc-sdk/cli [command] [options]
```
or using named binary
```bash
cere-ddc [command] [options]
```

## Help
To display basic commands and arguments -

```bash
npx @cere-ddc-sdk/cli --help
```

## Example

Upload a file to DDC

```bash
npx @cere-ddc-sdk/cli upload ./image.jpg network=testnet --signer="seed phrase" --bucketId=123
```

## Configuration

It is possible to provide configuration file instead of adding all options to a command line

```bash
npx @cere-ddc-sdk/cli upload ./image.jpg --config ./ddc.config.json
```

The configuration file example

```json
{
    "network": "testnet",
    "signer": "seed phrase",
    "signerType": "sr25519",
    "clusterId": "0x...",
}
```

# License

Licensed under the [Apache License](./LICENSE)
