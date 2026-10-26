#!/usr/bin/env node
// Checks that the SDK's bundled protos agree on the wire with ddc-proto: every
// field the SDK declares must have the same number, wire type and cardinality
// upstream. Fields the SDK leaves out are fine; package and file names may
// differ. Usage: node scripts/proto-parity.mjs <sdk-protos-dir> <ddc-proto-dir>

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// SDK file (relative to the SDK protos dir) -> ddc-proto file (relative to its proto/ dir).
const PAIRS = [
  ['activity_report/activity_report.proto', 'activity/record.proto'],
  ['common/signature.proto', 'signature/signature.proto'],
  ['auth_token.proto', 'auth/token.proto'],
];

const WIRE_TYPE = {
  TYPE_INT32: 0,
  TYPE_INT64: 0,
  TYPE_UINT32: 0,
  TYPE_UINT64: 0,
  TYPE_SINT32: 0,
  TYPE_SINT64: 0,
  TYPE_BOOL: 0,
  TYPE_ENUM: 0,
  TYPE_FIXED64: 1,
  TYPE_SFIXED64: 1,
  TYPE_DOUBLE: 1,
  TYPE_STRING: 2,
  TYPE_BYTES: 2,
  TYPE_MESSAGE: 2,
  TYPE_GROUP: 3,
  TYPE_FIXED32: 5,
  TYPE_SFIXED32: 5,
  TYPE_FLOAT: 5,
};

function descriptorText(root, file) {
  const dir = mkdtempSync(join(tmpdir(), 'proto-parity-'));
  try {
    const set = join(dir, 'set.pb');
    execFileSync('protoc', ['-I', root, '--include_imports', `--descriptor_set_out=${set}`, file]);
    // PROTOC_INCLUDE points at protoc's bundled include dir when it is not on the default path.
    const include = process.env.PROTOC_INCLUDE ? `-I "${process.env.PROTOC_INCLUDE}"` : '';
    return execFileSync(
      'sh',
      [
        '-c',
        `protoc ${include} --decode=google.protobuf.FileDescriptorSet google/protobuf/descriptor.proto < "${set}"`,
      ],
      {
        encoding: 'utf8',
      },
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Parses protoc's text format into { key: [values] }, nested blocks as objects.
function parseText(text) {
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}:]|[^\s{}:"]+/g) ?? [];
  let i = 0;
  const block = () => {
    const out = {};
    while (i < tokens.length && tokens[i] !== '}') {
      const key = tokens[i++];
      let value;
      if (tokens[i] === ':') i++;
      if (tokens[i] === '{') {
        i++;
        value = block();
        i++;
      } else {
        value = tokens[i++];
        if (value.startsWith('"')) value = JSON.parse(value);
      }
      (out[key] ??= []).push(value);
    }
    return out;
  };
  return block();
}

const one = (node, key) => node[key]?.[0];
const simpleName = (typeName) => (typeName ?? '').split('.').pop();

// Collects messages and enums defined in `file` (not its imports), keyed by name.
function definitions(root, file) {
  const set = parseText(descriptorText(root, file));
  const fileNode = (set.file ?? []).find((f) => one(f, 'name') === file);
  if (!fileNode) throw new Error(`${file}: not found in its own descriptor set`);
  const messages = new Map();
  const enums = new Map();
  const walkEnums = (node) => {
    for (const e of node.enum_type ?? []) {
      enums.set(one(e, 'name'), new Map((e.value ?? []).map((v) => [one(v, 'name'), Number(one(v, 'number'))])));
    }
  };
  const walkMessages = (node) => {
    for (const m of node.message_type ?? node.nested_type ?? []) {
      const fields = new Map();
      for (const f of m.field ?? []) {
        const type = one(f, 'type');
        fields.set(one(f, 'name'), {
          number: Number(one(f, 'number')),
          wire: WIRE_TYPE[type],
          repeated: one(f, 'label') === 'LABEL_REPEATED',
          type,
          typeName: simpleName(one(f, 'type_name')),
        });
      }
      messages.set(one(m, 'name'), fields);
      walkEnums(m);
      walkMessages({ nested_type: m.nested_type ?? [] });
    }
  };
  walkEnums(fileNode);
  walkMessages({ message_type: fileNode.message_type ?? [] });
  return { messages, enums };
}

function compare(sdkFile, upstreamFile, sdk, upstream) {
  const failures = [];
  const notes = [];
  for (const [message, sdkFields] of sdk.messages) {
    const upFields = upstream.messages.get(message);
    if (!upFields) {
      notes.push(`${message}: not defined in ${upstreamFile}`);
      continue;
    }
    const upByNumber = new Map([...upFields].map(([name, f]) => [f.number, { name, ...f }]));
    for (const [name, f] of sdkFields) {
      const up = upFields.get(name);
      const at = `${message}.${name}`;
      if (up) {
        if (up.number !== f.number) failures.push(`${at}: field ${f.number} in the SDK, ${up.number} upstream`);
        if (up.wire !== f.wire)
          failures.push(`${at}: wire type ${f.wire} (${f.type}) in the SDK, ${up.wire} (${up.type}) upstream`);
        if (up.repeated !== f.repeated)
          failures.push(`${at}: repeated=${f.repeated} in the SDK, ${up.repeated} upstream`);
        if (f.wire === 2 && f.typeName !== up.typeName)
          failures.push(`${at}: type ${f.typeName || f.type} in the SDK, ${up.typeName || up.type} upstream`);
        continue;
      }
      const same = upByNumber.get(f.number);
      if (!same) {
        failures.push(`${at}: field ${f.number} does not exist upstream`);
      } else if (same.wire !== f.wire || same.repeated !== f.repeated) {
        failures.push(
          `${at}: field ${f.number} is ${message}.${same.name} upstream with a different wire type or cardinality`,
        );
      } else {
        notes.push(`${at}: field ${f.number} is named ${same.name} upstream (same wire type)`);
      }
    }
  }
  for (const [enumName, sdkValues] of sdk.enums) {
    const upValues = upstream.enums.get(enumName);
    if (!upValues) {
      notes.push(`enum ${enumName}: not defined in ${upstreamFile}`);
      continue;
    }
    for (const [name, number] of sdkValues) {
      if (upValues.has(name) && upValues.get(name) !== number) {
        failures.push(`enum ${enumName}.${name}: ${number} in the SDK, ${upValues.get(name)} upstream`);
      } else if (!upValues.has(name) && ![...upValues.values()].includes(number)) {
        failures.push(`enum ${enumName}.${name}: value ${number} does not exist upstream`);
      }
    }
  }
  return { failures: failures.map((x) => `${sdkFile}: ${x}`), notes: notes.map((x) => `${sdkFile}: ${x}`) };
}

const [sdkRoot, upstreamRepo] = process.argv.slice(2);
if (!sdkRoot || !upstreamRepo) {
  console.error('usage: node scripts/proto-parity.mjs <sdk-protos-dir> <ddc-proto-dir>');
  process.exit(2);
}
const upstreamRoot = join(upstreamRepo, 'proto');

let failed = 0;
for (const [sdkFile, upstreamFile] of PAIRS) {
  const { failures, notes } = compare(
    sdkFile,
    upstreamFile,
    definitions(sdkRoot, sdkFile),
    definitions(upstreamRoot, upstreamFile),
  );
  for (const n of notes) console.log(`note: ${n}`);
  for (const f of failures) console.error(`FAIL: ${f}`);
  console.log(`${sdkFile} vs ddc-proto ${upstreamFile}: ${failures.length} mismatch(es)`);
  failed += failures.length;
}
process.exit(failed === 0 ? 0 : 1);
