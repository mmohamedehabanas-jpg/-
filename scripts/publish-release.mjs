#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const manifestPath = path.join(ROOT, 'releases', 'version-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const candidateApks = [
  getArg('--apk'),
  path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
  path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk'),
].filter(Boolean);

let sourceApk = null;
for (const candidate of candidateApks) {
  const resolved = path.isAbsolute(candidate) ? candidate : path.resolve(ROOT, candidate);
  if (fs.existsSync(resolved)) {
    sourceApk = resolved;
    break;
  }
}

if (!sourceApk) {
  console.error('Error: No compiled APK found. Pass --apk <path> or build via Gradle first.');
  process.exit(1);
}

// Verify ZIP/APK magic header
const fd = fs.openSync(sourceApk, 'r');
const hdr = Buffer.alloc(4);
fs.readSync(fd, hdr, 0, 4, 0);
fs.closeSync(fd);
if (!(hdr[0] === 0x50 && hdr[1] === 0x4b && hdr[2] === 0x03 && hdr[3] === 0x04)) {
  console.error(`Error: ${sourceApk} is not a valid APK/ZIP archive.`);
  process.exit(1);
}

const apkData = fs.readFileSync(sourceApk);
const sha256 = crypto.createHash('sha256').update(apkData).digest('hex');
const sizeBytes = apkData.length;

const targetFilename = `haqq-allah-v${manifest.latestVersion}-release.apk`;
const targetPath = path.join(ROOT, 'releases', targetFilename);
fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.copyFileSync(sourceApk, targetPath);

const mandatoryFlag = args.includes('--mandatory');
const noteArg = getArg('--note');
const remoteUrl = getArg('--apk-url');

manifest.apkFileName = targetFilename;
manifest.apkDownloadUrl = remoteUrl || '/api/download/apk';
manifest.sha256 = sha256;
manifest.fileSizeBytes = sizeBytes;
manifest.apkAvailable = true;
manifest.releaseDate = new Date().toISOString().slice(0, 10);
if (mandatoryFlag) manifest.mandatoryUpdate = true;
if (noteArg) {
  manifest.releaseNotes = [noteArg, ...(manifest.releaseNotes || [])];
}

manifest.history = [
  {
    version: manifest.latestVersion,
    versionCode: manifest.latestVersionCode,
    releaseDate: manifest.releaseDate,
    mandatory: manifest.mandatoryUpdate,
    notes: manifest.releaseNotes,
  },
  ...(manifest.history || []).filter((h) => h.versionCode !== manifest.latestVersionCode),
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
fs.writeFileSync(path.join(ROOT, 'releases', 'SHA256SUMS.txt'), `${sha256}  ${targetFilename}\n`, 'utf-8');

console.log(`✓ Published release artifact: releases/${targetFilename}`);
console.log(`✓ Size: ${sizeBytes} bytes (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`✓ SHA-256: ${sha256}`);
console.log(`✓ Updated releases/version-manifest.json (v${manifest.latestVersion}, code ${manifest.latestVersionCode})`);
