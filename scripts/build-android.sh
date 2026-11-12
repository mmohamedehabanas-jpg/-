#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=================================================="
echo "  Haqq Allah - Android Debug & Release APK Build"
echo "=================================================="

echo "[1/4] Building production web assets..."
npm run build

echo "[2/4] Synchronizing web & audio assets to Android project..."
npm run android:sync

echo "[3/4] Compiling Android Debug & Release APKs with Gradle..."
cd android
chmod +x ./gradlew

./gradlew assembleDebug --no-daemon
./gradlew assembleRelease --no-daemon

cd "$ROOT_DIR"

echo "[4/4] Verifying generated APKs..."
DEBUG_APK="android/app/build/outputs/apk/debug/app-debug.apk"
RELEASE_APK="android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$DEBUG_APK" ]; then
  echo "✓ Debug APK: $DEBUG_APK"
  sha256sum "$DEBUG_APK" || shasum -a 256 "$DEBUG_APK"
fi

if [ -f "$RELEASE_APK" ]; then
  echo "✓ Release APK: $RELEASE_APK"
  sha256sum "$RELEASE_APK" || shasum -a 256 "$RELEASE_APK"
  echo "To publish to releases/version-manifest.json, run:"
  echo "  npm run release:publish -- --apk $RELEASE_APK"
fi
