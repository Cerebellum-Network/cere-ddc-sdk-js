#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { upload } from './upload';
import { createBucket } from './createBucket';
import { deposit } from './deposit';
import { withClient } from './createClient';
import { account } from './account';

yargs(hideBin(process.argv))
  .demandCommand()
  .config('config', 'Configuration file path', (path) => JSON.parse(fs.readFileSync(path, 'utf-8')))
  .option('network', {
    alias: 'n',
    choices: ['devnet', 'testnet', 'mainnet'],
    default: 'devnet',
    describe: 'DDC network',
  })
  .option('signer', {
    alias: 's',
    type: 'string',
    demandOption: true,
    describe: 'Mnemonic of the actor wallet',
  })
  .option('signerType', {
    choices: ['sr25519', 'ed25519'],
    default: 'sr25519',
    describe: 'Type of the actor wallet signer',
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
        }),
    async (argv) => {
      const { isDirectory, cid } = await withClient(argv, (client) => upload(client, argv.path, argv));

      console.group(isDirectory ? 'Directory upload completed' : 'File upload completed');
      console.log('Network:', argv.network);
      console.log('Bucket ID:', argv.bucketId);
      console.log('Path:', argv.path);
      console.log('CID:', cid);

      if (argv.name) {
        console.log('CNS name:', argv.name);
      }

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
          default: 'public',
          describe: 'Whether the bucket is public',
        }),
    async ({ bucketAccess, ...argv }) => {
      const bucketId = await withClient(argv, (client) =>
        createBucket(client, { ...argv, isPublic: argv.bucketAccess === 'public' }),
      );

      console.group('Deposit completed');
      console.log('Network:', argv.network);
      console.log('Cluster ID:', argv.clusterId);
      console.log('Bucket ID:', bucketId);
      console.groupEnd();
    },
  )
  .command(
    'account',
    'Prints DDC account information',
    (yargs) => yargs,
    async (argv) => {
      const acc = await withClient(argv, (client) => account(client, argv));

      console.group('Account information');
      console.log('Network:', argv.network);
      console.log('Address:', acc.address);
      console.log('Balance:', acc.balance);
      console.log('Deposit:', acc.deposit);
      console.groupEnd();
    },
  )
  .parse();
