# Cere DDC SDK examples

This examples directory contains several common DDC SDK use-cases for NodeJs applications.

- [How to create a bucket](./1-create-bucket/index.ts)
- [How to store and read a file](./2-store-read-file/index.ts)
- [How to upload a website](./3-upload-website/index.ts)
- [How to stream events](./4-store-read-events/index.ts)
- [How to use exported account (Cere Wallet)](./5-use-exported-account/index.ts)
- [How to index files so that they are visible in Developer Console](./6-developer-console-compatibility/index.ts)
- [How to share access to a content in private bucket](./7-private-bucket-access-sharing/index.ts)

## Quick start

Run the following commands from the project root

1. Prepare Node.JS version

   ```
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm i
   ```

3. Build all SDK packages

   ```bash
   npm run build
   ```

4. Go to `examples` directory

   ```bash
   cd ./examples/node
   ```

5. Run an example

   ```bash
   npm run example:1 # can be 1-7
   ```

  


