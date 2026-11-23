#!/usr/bin/env node
/**
 * Synchronizes the standalone `/plugin/` package from the root application source.
 * Copies `components/`, `lib/` (runtime modules only), and `public/{data,workers}`
 * while rewriting `@/lib/*` and `@/components/*` aliases to pure relative imports
 * so `/plugin/` can be dropped into any React / Next.js / Vite project without extra tsconfig aliases.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PLUGIN_DIR = path.join(ROOT_DIR, 'plugin');
const PLUGIN_COMPONENTS_DIR = path.join(PLUGIN_DIR, 'src', 'components');
const PLUGIN_LIB_DIR = path.join(PLUGIN_DIR, 'src', 'lib');
const PLUGIN_PUBLIC_DIR = path.join(PLUGIN_DIR, 'public');

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function rewriteImportsForPlugin(source, kind) {
  let out = source;
  if (kind === 'component') {
    out = out.replace(/(['"])@\/lib\/([^'"]+)\1/g, '$1../lib/$2$1');
    out = out.replace(/(['"])@\/components\/([^'"]+)\1/g, '$1./$2$1');
  } else {
    out = out.replace(/(['"])@\/lib\/([^'"]+)\1/g, '$1./$2$1');
    out = out.replace(/(['"])@\/components\/([^'"]+)\1/g, '$1../components/$2$1');
  }
  return out;
}

function copyDirectoryRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Sync runtime components
ensureCleanDir(PLUGIN_COMPONENTS_DIR);
const componentFiles = fs
  .readdirSync(path.join(ROOT_DIR, 'components'))
  .filter((f) => /\.(tsx?|jsx?)$/.test(f) && !f.includes('.test.'));

for (const file of componentFiles) {
  const raw = fs.readFileSync(path.join(ROOT_DIR, 'components', file), 'utf8');
  const rewritten = rewriteImportsForPlugin(raw, 'component');
  fs.writeFileSync(path.join(PLUGIN_COMPONENTS_DIR, file), rewritten, 'utf8');
}

// 2. Sync runtime lib modules (exclude *.test.ts)
ensureCleanDir(PLUGIN_LIB_DIR);
const libFiles = fs
  .readdirSync(path.join(ROOT_DIR, 'lib'))
  .filter((f) => /\.(tsx?|jsx?)$/.test(f) && !f.includes('.test.'));

for (const file of libFiles) {
  const raw = fs.readFileSync(path.join(ROOT_DIR, 'lib', file), 'utf8');
  const rewritten = rewriteImportsForPlugin(raw, 'lib');
  fs.writeFileSync(path.join(PLUGIN_LIB_DIR, file), rewritten, 'utf8');
}

// 3. Sync static star tiles, Web Worker, and brand logo assets
ensureCleanDir(PLUGIN_PUBLIC_DIR);
for (const sub of ['data', 'workers']) {
  const srcSub = path.join(ROOT_DIR, 'public', sub);
  if (fs.existsSync(srcSub)) {
    copyDirectoryRecursive(srcSub, path.join(PLUGIN_PUBLIC_DIR, sub));
  }
}
for (const assetFile of ['logo.jpg', 'logo.svg', 'sunset-hero.jpg']) {
  const srcAsset = path.join(ROOT_DIR, 'public', assetFile);
  if (fs.existsSync(srcAsset)) {
    fs.copyFileSync(srcAsset, path.join(PLUGIN_PUBLIC_DIR, assetFile));
  }
}

console.log(
  `Synced Milky Way Observatory plugin: ${componentFiles.length} components, ${libFiles.length} lib modules, and static star assets -> plugin/`
);
