#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const distDir = path.join(ROOT, 'dist');
const androidAssetsDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets');
const targetDistDir = path.join(androidAssetsDir, 'dist');
const publicAudioDir = path.join(ROOT, 'public', 'audio');
const targetAudioDir = path.join(androidAssetsDir, 'audio');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

fs.rmSync(targetDistDir, { recursive: true, force: true });
fs.mkdirSync(targetDistDir, { recursive: true });
fs.cpSync(distDir, targetDistDir, { recursive: true });

if (fs.existsSync(publicAudioDir)) {
  fs.mkdirSync(targetAudioDir, { recursive: true });
  fs.cpSync(publicAudioDir, targetAudioDir, { recursive: true });
}

console.log('✓ Synchronized dist/ -> android/app/src/main/assets/dist/');
console.log('✓ Synchronized public/audio/ -> android/app/src/main/assets/audio/');
