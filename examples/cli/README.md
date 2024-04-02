# DDC CLI examples

This example shows how to use DDC CLI

## Create DDC customer account

1. Generate a new account

    ```bash
    npx cere-ddc account --random
    ```
    Output
    ```
    New account
      Mnemonic: gospel fee escape timber toilet crouch artist catalog salt icon bulb ivory
      Type: sr25519
      Address: 6PxrvjkVJFrQs6Tqdeov1GcJkS5rpzuM3NYGhX8KQErv49V2
    ```
2. Create a configuration (eg. `ddc.config.json`) file with the following content
    ```json
    {
      "signer": "gospel fee escape timber toilet crouch artist catalog salt icon bulb ivory"
    }
    ```
3. Topup the account with CERE tokens either by using the faucet or by sending some amount of CERE tokens from another account.

    ```
    6PxrvjkVJFrQs6Tqdeov1GcJkS5rpzuM3NYGhX8KQErv49V2
    ```

4. Check the account balance

    ```bash
    npx cere-ddc --config ./ddc.config.json account
    ```
    Output
    ```
    Account information
      Network: testnet
      Type: sr25519
      Address: 6PxrvjkVJFrQs6Tqdeov1GcJkS5rpzuM3NYGhX8KQErv49V2
      Balance: 50
      Deposit: 0
    ```

5. Deposit 20 CERE tokens to the account

    ```
    npx cere-ddc --config ./ddc.config.json deposit 20
    ```
    Output
    ```
    Deposit completed
      Network: testnet
      Amount: 20
      Total deposit: 20
    ```

6. Check the account balance again

    ```bash
    npx cere-ddc --config ./ddc.config.json account
    ```
    Output
    ```
    Account information
      Network: testnet
      Type: sr25519
      Address: 6PxrvjkVJFrQs6Tqdeov1GcJkS5rpzuM3NYGhX8KQErv49V2
      Balance: 29
      Deposit: 20
    ```
    > Now we have some balance to pay transactions fee and deposit to pay for DDC operations

### Create a DDC bucket

1. Add `clusterId` to the configuration file (`ddc.config.json`)

    ```json
    {
      "signer": "gospel fee escape timber toilet crouch artist catalog salt icon bulb ivory",
      "clusterId": "0x825c4b2352850de9986d9d28568db6f0c023a1e3" // <--
    }
    ```

2. Create a private bucket

    ```bash
    npx cere-ddc --config ./ddc.config.json create-bucket --access private
    ```
    Output
    ```
    Deposit completed
      Network: testnet
      Cluster ID: 0x825c4b2352850de9986d9d28568db6f0c023a1e3
      Bucket ID: 27327n
    ```

3. Add `bucketId` to the configuration file (`ddc.config.json`)

    ```json
    {
      "signer": "gospel fee escape timber toilet crouch artist catalog salt icon bulb ivory",
      "clusterId": "0x825c4b2352850de9986d9d28568db6f0c023a1e3",
      "bucketId": "27327" // <--
    }
    ```

  ### Upload/download a file to the bucket

  1. Upload a file

      ```bash
      npx cere-ddc --config ./ddc.config.json upload ./2mb.jpg
      ```
      Output
      ```
      File upload completed
        Network: testnet
        Bucket ID: 27327n
        Path: 2mb.jpg
        CID: baebb4ide2ma4fvzr35kkgaqlnh5lgeojwsyhp4n4k7jc2qgsdizcariizm
      ```

  2. Download the file

      ```bash
      npx cere-ddc --config ./ddc.config.json download baebb4ide2ma4fvzr35kkgaqlnh5lgeojwsyhp4n4k7jc2qgsdizcariizm ./2mb-downloaded.jpg
      ```
      Output
      ```
      File download completed
        Network: testnet
        Bucket ID: 27327
        CID: baebb4ide2ma4fvzr35kkgaqlnh5lgeojwsyhp4n4k7jc2qgsdizcariizm
        Destination: 2mb-downloaded.jpg
      ```

3. Upload a folder with CNS name (eg. web application)

      ```bash
      npx cere-ddc --config ./ddc.config.json upload ./website --name my-website
      ```
      Output
      ```
      Directory upload completed
        Network: testnet
        Bucket ID: 27327n
        Path: website
        CID: baear4ibtwof4ixz2j7fv2dfbnoqw6qpfdm7ix4cphpzakfzqae32h3tf6y
        CNS name: my-website
      ```

4. Download the folder by the CNS name

      ```bash
      npx cere-ddc --config ./ddc.config.json download my-website ./website-downloaded
      ```
      Output
      ```
      Directory download completed
        Network: testnet
        Bucket ID: 27327
        CID: baear4ibtwof4ixz2j7fv2dfbnoqw6qpfdm7ix4cphpzakfzqae32h3tf6y
        CNS name: my-website
        Destination: website-downloaded
      ```

### Share access to the private bucket

1. Generate a new random account to share the access with

    ```bash
    npx cere-ddc account --random
    ```
    Output
    ```
    New account
      Mnemonic: promote egg ignore scatter ahead silent rice review blame arch enact exile
      Type: sr25519
      Address: 6UBQTtDw3zsXypKXbDH65Hvs3kETzYrv7xB7LXjvEQdMt6o6
    ```

2. Create a new configuration file for this account (`user.config.json`)

    ```json
    {
      "signer": "promote egg ignore scatter ahead silent rice review blame arch enact exile",
      "clusterId": "0x825c4b2352850de9986d9d28568db6f0c023a1e3",
      "bucketId": "27327",
    }
    ```

3. Upload a new file to the private bucket with `private-file` CNS name

      ```bash
      npx cere-ddc --config ./ddc.config.json upload ./2mb.jpg --name private-file
      ```
      Output
      ```
      File upload completed
        Network: testnet
        Bucket ID: 27327n
        Path: 2mb.jpg
        CID: baebb4ide2ma4fvzr35kkgaqlnh5lgeojwsyhp4n4k7jc2qgsdizcariizm
        CNS name: private-file
      ```

4. Attempt to download the file without access

    ```bash
    npx cere-ddc --config ./user.config.json download private-file ./2mb-private.jpg
    ```
    > It will fail with error, since the user does not have access to the private bucket

3. Generate a read-only auth token for the new account

    ```bash
    npx cere-ddc --config ./ddc.config.json token --operations get --subject 6UBQTtDw3zsXypKXbDH65Hvs3kETzYrv7xB7LXjvEQdMt6o6
    ```
    Output
    ```
    New auth token
      Operations: [ 'GET' ]
      Bucket ID: 27327n
      Subject: 6UBQTtDw3zsXypKXbDH65Hvs3kETzYrv7xB7LXjvEQdMt6o6
      Expires at: 2024-05-02T06:40:46.523Z
      Can delegate: false
      Signer: 6PxrvjkVJFrQs6Tqdeov1GcJkS5rpzuM3NYGhX8KQErv49V2
      Token: 3oWApfZNG8SzTbAQx5tR9cJ1LbYfV2hWmB53i1VpSqQQj7uoEstxz5AKjq3TgvXUkVSLZBer7Y5nCf9uAx1RJMKjbnM6bRRyLTAeirgYC7SHGoStGHoki7m9s8WFkJbdCDVEogGyJSa7eAJ59a68sx55EVcwG5NVanSGZTHaK97mviTQ1oKhQry7oKK6wWVj4UFDnKzXssuskUQQggNmW
    ```
4. Add the generated access token to the user configuration file

    ```json
    {
      "signer": "promote egg ignore scatter ahead silent rice review blame arch enact exile",
      "clusterId": "0x825c4b2352850de9986d9d28568db6f0c023a1e3",
      "bucketId": "27327",
      "accessToken": "3oWApfZNG8SzTbAQx5tR9cJ1LbYfV2hWmB53i1VpSqQQj7uoEstxz5AKjq3TgvXUkVSLZBer7Y5nCf9uAx1RJMKjbnM6bRRyLTAeirgYC7SHGoStGHoki7m9s8WFkJbdCDVEogGyJSa7eAJ59a68sx55EVcwG5NVanSGZTHaK97mviTQ1oKhQry7oKK6wWVj4UFDnKzXssuskUQQggNmW"
    }
    ```

4. Download the file with the access token

    ```bash
    npx cere-ddc --config ./user.config.json download private-file ./2mb-private.jpg --token 3oWApfZNG8SzTbAQx5tR9cJ1LbYfV2hWmB53i1VpSqQQj7uoEstxz5AKjq3TgvXUkVSLZBer7Y5nCf9uAx1RJMKjbnM6bRRyLTAeirgYC7SHGoStGHoki7m9s8WFkJbdCDVEogGyJSa7eAJ59a68sx55EVcwG5NVanSGZTHaK97mviTQ1oKhQry7oKK6wWVj4UFDnKzXssuskUQQggNmW
    ```
    or you can add the `accessToken` to the user configuration file
    ```json
    {
      "signer": "promote egg ignore scatter ahead silent rice review blame arch enact exile",
      "clusterId": "0x825c4b2352850de9986d9d28568db6f0c023a1e3",
      "bucketId": "27327",
      "accessToken": "3oWApfZNG8SzTbAQx5tR9cJ1LbYfV2hWmB53i1VpSqQQj7uoEstxz5AKjq3TgvXUkVSLZBer7Y5nCf9uAx1RJMKjbnM6bRRyLTAeirgYC7SHGoStGHoki7m9s8WFkJbdCDVEogGyJSa7eAJ59a68sx55EVcwG5NVanSGZTHaK97mviTQ1oKhQry7oKK6wWVj4UFDnKzXssuskUQQggNmW"
    }
    ```
    and then download it this way
    ```bash
    npx cere-ddc --config ./user.config.json download private-file ./2mb-private.jpg
    ```