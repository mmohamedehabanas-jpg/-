#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const versionPropsPath = path.join(ROOT, 'android', 'version.properties');
const pkgPath = path.join(ROOT, 'package.json');
const tsVersionPath = path.join(ROOT, 'src', 'config', 'version.ts');
const manifestPath = path.join(ROOT, 'releases', 'version-manifest.json');

const propsRaw = fs.readFileSync(versionPropsPath, 'utf-8');
const currentCodeMatch = propsRaw.match(/VERSION_CODE=(\d+)/);
const currentNameMatch = propsRaw.match(/VERSION_NAME=([^\r\n]+)/);

const currentCode = currentCodeMatch ? parseInt(currentCodeMatch[1], 10) : 30;
const currentName = currentNameMatch ? currentNameMatch[1].trim() : '3.0.0';

const nextCode = getArg('--code') ? parseInt(getArg('--code'), 10) : currentCode + 1;
if (Number.isNaN(nextCode) || nextCode <= currentCode) {
  console.error(`Error: New versionCode (${nextCode}) must be strictly greater than current (${currentCode}).`);
  process.exit(1);
}

let nextName = getArg('--name');
if (!nextName) {
  const parts = currentName.split('.').map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  nextName = parts.join('.');
}

const today = new Date().toISOString().slice(0, 10);

// 1. Update android/version.properties
const updatedProps = propsRaw
  .replace(/VERSION_CODE=\d+/, `VERSION_CODE=${nextCode}`)
  .replace(/VERSION_NAME=[^\r\n]+/, `VERSION_NAME=${nextName}`);
fs.writeFileSync(versionPropsPath, updatedProps, 'utf-8');

// 2. Update package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.version = nextName;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

// 3. Update src/config/version.ts
const tsContent = `// Centralized Client Version Identity (Synchronized with android/version.properties and releases/version-manifest.json)
export const APP_ID = 'com.haqqallah.app';
export const APP_NAME = 'حق الله - Haqq Allah';
export const APP_VERSION_NAME = '${nextName}';
export const APP_VERSION_CODE = ${nextCode};
export const APP_RELEASE_DATE = '${today}';
export const MIN_ANDROID_LABEL = 'Android 8.0+ (API 26+)';
`;
fs.writeFileSync(tsVersionPath, tsContent, 'utf-8');

// 4. Update releases/version-manifest.json
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
manifest.latestVersion = nextName;
manifest.latestVersionCode = nextCode;
manifest.releaseDate = today;
manifest.apkFileName = `haqq-allah-v${nextName}-release.apk`;
manifest.apkAvailable = false;
manifest.sha256 = null;
manifest.fileSizeBytes = 0;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

console.log(`✓ Bumped version: v${currentName} (${currentCode}) -> v${nextName} (${nextCode})`);
console.log('✓ Synchronized android/version.properties, package.json, src/config/version.ts, and releases/version-manifest.json');
