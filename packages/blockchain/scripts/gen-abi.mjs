// Regenerates src/customer_deposit.ts from src/customer_deposit.json.
// The ABI ships as a .ts module, not a JSON import: tsc emits JSON imports
// without the `with { type: 'json' }` attribute that Node's ESM loader
// requires, which made every deposit/balance call throw
// ERR_IMPORT_ATTRIBUTE_MISSING in a plain Node consumer.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(dir, '../src/customer_deposit.json');
const dest = path.resolve(dir, '../src/customer_deposit.ts');
const abi = readFileSync(src, 'utf8').trim();

writeFileSync(
  dest,
  [
    '// AUTO-GENERATED from customer_deposit.json — do not edit by hand.',
    '// Regenerate with `npm run build:abi` (see scripts/gen-abi.mjs for why the',
    '// ABI is a .ts module rather than a JSON import).',
    `export const customerDepositAbi = ${abi} as const;`,
    'export default customerDepositAbi;',
    '',
  ].join('\n'),
);
console.log(`generated ${path.relative(process.cwd(), dest)}`);
