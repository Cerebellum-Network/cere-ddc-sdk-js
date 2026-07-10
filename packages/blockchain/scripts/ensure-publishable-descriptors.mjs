// ensure-publishable-descriptors.mjs — make the generated papi descriptors
// survive `npm pack`, so a published `@cef-ai/chain` is actually consumable.
//
// `@cef-ai/chain` ships `.papi` (via the package `files` field) and depends on
// the generated descriptors through `"@polkadot-api/descriptors":
// "file:.papi/descriptors"`. The catch: `.papi/descriptors` is itself a package
// (it has a `package.json`), so npm-packlist treats it as a *nested package* and
// applies its OWN ignore rules when packing. papi writes a `.gitignore` there of
// `*` (keeping only `.gitignore` + `package.json`), which strips the generated
// `dist/` from the tarball — leaving a consumer with a descriptors package that
// has no code, so `import "@cef-ai/chain"` throws at runtime. (The repo-root
// `dist/` ignore compounds this; neither the parent `files` allowlist nor a
// chain-root `.npmignore` overrides a *nested* package's ignore rules — only an
// ignore file inside the descriptors dir does.)
//
// Fix: drop an `.npmignore` INTO the descriptors dir. For a nested package,
// npm-packlist prefers `.npmignore` over `.gitignore`, so an empty one disables
// the `*` rule and the generated `dist/` ships. This runs in `prepare`, right
// after `papi generate`, so it is present for every `pnpm pack`/`publish` and on
// a fresh clone alike. The descriptors dir is gitignored, so this file cannot be
// committed — it must be (re)written at build time.
//
// SECOND fix: strip the `@polkadot-api/descriptors` dependency from the
// to-be-published package.json. `papi generate` (run just before this in
// `prepare`) auto-inserts `"@polkadot-api/descriptors": "file:.papi/descriptors"`
// into dependencies. A `file:` spec is resolved by the *consumer* against THEIR
// own project root, so every downstream `pnpm add @cef-ai/chain` (and anything
// pulling it transitively — account → vault-sdk → testing) fails with
// ERR_PNPM_LINKED_PKG_DIR_NOT_FOUND. We don't need the dependency at all: the
// generated descriptors ship inside this package and `src` imports them via the
// `#descriptors` subpath (package `imports` map), which resolves relative to
// THIS package in both the workspace and a published consumer. So we delete the
// dep here, after papi re-adds it, leaving a clean, self-contained manifest for
// `pnpm pack` / `pnpm publish`. (The workspace copy keeps getting the dep
// re-added by papi for local dev — harmless; this script makes the published
// artifact correct.)
//
// Also guards that descriptors were actually generated (the old `prepublishOnly`
// check), failing loudly with a fix hint rather than shipping an empty package.

import { existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const descriptorsDir = join(pkgRoot, ".papi", "descriptors");
const descriptorsDist = join(descriptorsDir, "dist");

if (!existsSync(join(descriptorsDir, "package.json")) || !existsSync(descriptorsDist)) {
  console.error(
    "@cef-ai/chain: .papi/descriptors not generated — run " +
      "`pnpm --filter @cef-ai/chain generate` before packing/publishing.",
  );
  process.exit(1);
}

if (readdirSync(descriptorsDist).length === 0) {
  console.error("@cef-ai/chain: .papi/descriptors/dist is empty — regenerate the descriptors.");
  process.exit(1);
}

// Empty .npmignore → nested package ships everything its `files` field allows
// (its `dist`), instead of obeying papi's `*` .gitignore.
writeFileSync(join(descriptorsDir, ".npmignore"), "");

// Strip the papi-injected `file:.papi/descriptors` dependency so the published
// manifest is self-contained (consumers resolve the bundled descriptors via the
// `#descriptors` imports map instead). Idempotent: a no-op if already absent.
const pkgJsonPath = join(pkgRoot, "package.json");
const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
if (pkg.dependencies && "@polkadot-api/descriptors" in pkg.dependencies) {
  delete pkg.dependencies["@polkadot-api/descriptors"];
  writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    "@cef-ai/chain: removed file:.papi/descriptors dependency for publish " +
      "(descriptors resolve via the #descriptors imports map).",
  );
}
