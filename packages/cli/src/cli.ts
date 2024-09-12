#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { mnemonicGenerate } from '@polkadot/util-crypto';

import { upload } from './upload';
import { createBucket } from './createBucket';
import { deposit } from './deposit';
import { withClient, createCorrelationId } from './createClient';
import { account } from './account';
import { download } from './download';
import { decodeToken, createToken } from './token';

yargs(hideBin(process.argv))
  .wrap(null)
  .demandCommand()
  .config('config', 'Configuration file path', (path) => JSON.parse(fs.readFileSync(path, 'utf-8')))
  .option('network', {
    alias: 'n',
    choices: ['devnet', 'testnet', 'mainnet'],
    default: 'testnet',
    describe: 'DDC network',
  })

  .option('blockchainRpc', {
    alias: ['rpc'],
    type: 'string',
    describe: 'Blockchain RPC URL. Owerrides the network default RPC URL',
  })

  .option('signer', {
    alias: 's',
    type: 'string',
    demandOption: true,
    describe: 'Mnemonic or a backup file path of the actor wallet',
  })
  .option('signerType', {
    choices: ['sr25519', 'ed25519'],
    default: 'sr25519',
    describe: 'Type of the actor wallet signer',
  })
  .option('signerPassphrase', {
    alias: 'p',
    string: true,
    default: '',
    describe: 'Passphrase to unlock the actor wallet signer',
  })
  .option('logLevel', {
    alias: 'log',
    choices: ['silent', 'warn', 'info', 'debug', 'error'],
    default: 'silent',
    describe: 'Log level for DDC client',
  })
  .command(
    'upload <path>',
    'Uploads file or directory to DDC',
    (yargs) =>
      yargs
        .positional('path', {
          type: 'string',
          normalize: true,
          demandOption: true,
          describe: 'Path to directory or file to upload',
        })
        .option('bucketId', {
          alias: 'b',
          type: 'string',
          demandOption: true,
          describe: 'Bucket ID',
        })
        .option('cnsName', {
          alias: 'name',
          type: 'string',
          describe: 'CNS name of the uploaded piece',
        })
        .option('accessToken', {
          alias: ['t', 'token'],
          type: 'string',
          describe: 'Access token to upload the file',
        })
        .option('correlationId', {
          type: 'string',
          default: '',
          defaultDescription: 'Randomly generated',
          describe: 'Correlation ID for DDC opperations',
        }),
    async (argv) => {
      argv.correlationId ||= createCorrelationId();

      const { isDirectory, cid } = await withClient(argv, (client) => upload(client, argv.path, argv));

      console.group(isDirectory ? 'Directory upload completed' : 'File upload completed');
      console.log('Correlation ID:', argv.correlationId);
      console.log('Network:', argv.network);
      console.log('Bucket ID:', BigInt(argv.bucketId));
      console.log('Path:', argv.path);
      console.log('CID:', cid);

      if (argv.name) {
        console.log('CNS name:', argv.name);
      }

      console.groupEnd();
    },
  )
  .command(
    'download <source> [dest]',
    'Downloads file or directory from DDC',
    (yargs) =>
      yargs
        .positional('source', {
          type: 'string',
          demandOption: true,
          describe: 'CID or CNS name of the file or directory to download',
        })
        .positional('dest', {
          type: 'string',
          normalize: true,
          default: '.',
          describe: 'Destination path to save the downloaded file or directory',
        })
        .option('accessToken', {
          alias: ['t', 'token'],
          type: 'string',
          describe: 'Access token to download the file',
        })
        .option('bucketId', {
          alias: 'b',
          type: 'string',
          demandOption: true,
          describe: 'Bucket ID',
        })
        .option('correlationId', {
          type: 'string',
          default: '',
          defaultDescription: 'Randomly generated',
          describe: 'Correlation ID for DDC opperations',
        }),
    async (argv) => {
      argv.correlationId ||= createCorrelationId();

      const result = await withClient(argv, (client) => download(client, argv.source, argv.dest, argv));

      console.group(result.isDirectory ? 'Directory download completed' : 'File download completed');
      console.log('Correlation ID:', argv.correlationId);
      console.log('Network:', argv.network);
      console.log('Bucket ID:', argv.bucketId);
      console.log('CID:', result.cid);

      if (result.cnsName) {
        console.log('CNS name:', result.cnsName);
      }

      console.log('Destination:', result.dest);

      console.groupEnd();
    },
  )
  .command(
    'deposit <amount>',
    'Deposit CERE tokens',
    (yargs) =>
      yargs
        .positional('amount', {
          type: 'number',
          demandOption: true,
          describe: 'Amount of CERE tokens to deposit',
        })
        .option('allowExtra', {
          type: 'boolean',
          default: true,
          describe: 'Whether to allow extra amount to be deposited',
        }),
    async (argv) => {
      const total = await withClient(argv, (client) => deposit(client, argv.amount, argv));

      console.group('Deposit completed');
      console.log('Network:', argv.network);
      console.log('Amount:', argv.amount);
      console.log('Total deposit:', total);
      console.groupEnd();
    },
  )
  .command(
    'create-bucket',
    'Creates a new bucket in DDC cluster',
    (yargs) =>
      yargs
        .option('clusterId', {
          alias: 'c',
          type: 'string',
          demandOption: true,
          describe: 'Cluster ID where the bucket will be created',
        })
        .option('bucketAccess', {
          alias: 'access',
          choices: ['public', 'private'],
          default: 'private',
          describe: 'Whether the bucket is public',
        }),
    async ({ bucketAccess, ...argv }) => {
      const bucketId = await withClient(argv, (client) =>
        createBucket(client, { ...argv, isPublic: bucketAccess === 'public' }),
      );

      console.group('Bucket created');
      console.log('Network:', argv.network);
      console.log('Cluster ID:', argv.clusterId);
      console.log('Bucket ID:', Number(bucketId));
      console.log('Access:', bucketAccess);
      console.groupEnd();
    },
  )
  .command(
    'account',
    'Prints DDC account information',
    (yargs) =>
      yargs
        .option('random', {
          alias: 'r',
          type: 'boolean',
          default: false,
          describe: 'Force to generate a random account',
        })
        .option('signer', {
          alias: 's',
          type: 'string',
          default: '',
          defaultDescription: 'Randomly generated',
          describe: 'Mnemonic or a backup file path of an account to get information about',
        }),
    async (argv) => {
      if (argv.random || !argv.signer) {
        argv.signer = mnemonicGenerate();
        argv.random = true;
      }

      const acc = argv.random ? await account(null, argv) : await withClient(argv, (client) => account(client, argv));

      console.group(argv.random ? 'New account' : 'Account information');

      if (!argv.random) {
        console.log('Network:', argv.network);
      } else {
        console.log('Mnemonic:', argv.signer);
      }

      console.log('Type:', acc.type);
      console.log('Address:', acc.address);
      console.log('Public key:', acc.publicKey);

      if (!argv.random) {
        console.log('Balance:', acc.balance);
        console.log('Deposit:', acc.deposit);
      }

      console.groupEnd();
    },
  )
  .command(
    'token [token]',
    'Generates DDC auth token',
    (yargs) =>
      yargs
        .positional('token', {
          type: 'string',
          describe: 'Token to decode',
        })
        .option('operations', {
          alias: 'o',
          type: 'array',
          choices: ['get', 'put', 'delete'],
          default: ['get'],
          describe: 'Operations allowed by the token',
        })
        .option('bucketId', {
          alias: 'b',
          type: 'string',
          describe: 'Bucket ID to grant access to',
        })
        .option('pieceCid', {
          alias: 'cid',
          type: 'string',
          describe: 'CID to grant access to',
        })
        .option('subject', {
          alias: 'to',
          type: 'string',
          describe: 'The account to delegate access to',
        })
        .option('prevToken', {
          alias: 'prev',
          type: 'string',
          describe: 'Previous token in delegation chain',
        })
        .option('canDelegate', {
          type: 'boolean',
          default: false,
          describe: 'Whether the token can be delegated',
        })
        .option('expiresIn', {
          type: 'number',
          describe: 'Token expiration time in milliseconds',
        })
        .option('signer', {
          alias: 's',
          type: 'string',
          default: '',
          describe: 'Mnemonic of an account to sign the token',
        }),
    async (argv) => {
      const result = argv.token ? await decodeToken(argv.token) : await createToken(argv);

      console.group(argv.token ? 'Decoded auth token' : 'New auth token');
      console.log('Operations:', result.operations);

      if (result.bucketId) {
        console.log('Bucket ID:', result.bucketId);
      }

      if (result.cid) {
        console.log('CID:', result.cid);
      }

      if (result.subject) {
        console.log('Subject:', result.subject);
      }

      if (result.expiresAt) {
        console.log('Expires at:', new Date(result.expiresAt).toISOString());
      }

      console.log('Can delegate:', result.canDelegate);

      if (result.signer) {
        console.log('Signer:', result.signer);
      }

      console.log('Token:', result.token);
      console.groupEnd();
    },
  )

  .parse();
