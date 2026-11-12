import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MANIFEST_PATH = path.resolve(__dirname, 'releases', 'version-manifest.json');
const RELEASES_DIR = path.resolve(__dirname, 'releases');

interface ReleaseManifest {
  appId: string;
  appName: string;
  latestVersion: string;
  latestVersionCode: number;
  minSupportedVersion: string;
  minSupportedVersionCode: number;
  mandatoryUpdate: boolean;
  releaseDate: string;
  apkFileName: string;
  apkDownloadUrl: string;
  sha256: string | null;
  fileSizeBytes: number;
  apkAvailable: boolean;
  buildType: string;
  minAndroidVersion: string;
  targetSdk: number;
  releaseNotes: string[];
  history?: Array<{
    version: string;
    versionCode: number;
    releaseDate: string;
    mandatory?: boolean;
    notes: string[];
  }>;
}

interface CachedHash {
  mtimeMs: number;
  size: number;
  sha256: string;
}

const fileHashCache = new Map<string, CachedHash>();

function isValidZipApkHeader(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < 1024) return false;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    // APK files are ZIP archives starting with PK\x03\x04
    return buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
  } catch {
    return false;
  }
}

async function computeFileSha256(filePath: string): Promise<{ sha256: string; size: number }> {
  const stat = fs.statSync(filePath);
  const cached = fileHashCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return { sha256: cached.sha256, size: stat.size };
  }

  const sha256 = await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });

  fileHashCache.set(filePath, {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    sha256,
  });

  return { sha256, size: stat.size };
}

function findCompiledApk(preferredVariant?: 'release' | 'debug'): {
  path: string;
  variant: 'release' | 'debug';
  filename: string;
} | null {
  const releaseCandidates = [
    path.join(RELEASES_DIR, 'haqq-allah-release.apk'),
    path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
    path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'haqq-allah-v3.0.0-release.apk'),
    path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'haqq-allah-v3.0-release.apk'),
    path.join(__dirname, 'release-output', 'haqq-allah-v3.0.0-release.apk'),
  ];

  const debugCandidates = [
    path.join(RELEASES_DIR, 'haqq-allah-debug.apk'),
    path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  ];

  // Also check any *.apk placed directly in releases/
  if (fs.existsSync(RELEASES_DIR)) {
    for (const entry of fs.readdirSync(RELEASES_DIR)) {
      if (entry.endsWith('.apk')) {
        const full = path.join(RELEASES_DIR, entry);
        if (entry.includes('debug')) {
          debugCandidates.unshift(full);
        } else {
          releaseCandidates.unshift(full);
        }
      }
    }
  }

  const ordered =
    preferredVariant === 'debug'
      ? [...debugCandidates.map((p) => ({ p, v: 'debug' as const })), ...releaseCandidates.map((p) => ({ p, v: 'release' as const }))]
      : [...releaseCandidates.map((p) => ({ p, v: 'release' as const })), ...debugCandidates.map((p) => ({ p, v: 'debug' as const }))];

  for (const item of ordered) {
    if (fs.existsSync(item.p) && isValidZipApkHeader(item.p)) {
      return {
        path: item.p,
        variant: item.v,
        filename: path.basename(item.p),
      };
    }
  }

  return null;
}

function readRawManifest(): ReleaseManifest {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw) as ReleaseManifest;
}

async function getHydratedManifest(): Promise<
  ReleaseManifest & {
    androidProjectZipUrl: string;
    availableVariants: { release: boolean; debug: boolean };
  }
> {
  const manifest = readRawManifest();
  const releaseApk = findCompiledApk('release');
  const debugApk = findCompiledApk('debug');
  const primaryApk = releaseApk && releaseApk.variant === 'release' ? releaseApk : releaseApk || debugApk;

  if (primaryApk) {
    const { sha256, size } = await computeFileSha256(primaryApk.path);
    return {
      ...manifest,
      apkAvailable: true,
      apkFileName: primaryApk.filename,
      apkDownloadUrl: manifest.apkDownloadUrl.startsWith('https://') ? manifest.apkDownloadUrl : '/api/download/apk',
      sha256,
      fileSizeBytes: size,
      buildType: primaryApk.variant,
      androidProjectZipUrl: '/api/download/android-project.zip',
      availableVariants: {
        release: releaseApk?.variant === 'release',
        debug: Boolean(debugApk && debugApk.variant === 'debug'),
      },
    };
  }

  const hasRemoteApk = typeof manifest.apkDownloadUrl === 'string' && manifest.apkDownloadUrl.startsWith('https://');
  return {
    ...manifest,
    apkAvailable: hasRemoteApk && Boolean(manifest.sha256),
    androidProjectZipUrl: '/api/download/android-project.zip',
    availableVariants: {
      release: false,
      debug: false,
    },
  };
}

function addDirectoryToZip(zip: JSZip, dirPath: string, zipFolderPrefix: string, excludeNames: Set<string>) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeNames.has(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    const relZipPath = zipFolderPrefix ? `${zipFolderPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      addDirectoryToZip(zip, fullPath, relZipPath, excludeNames);
    } else if (entry.isFile()) {
      zip.file(relZipPath, fs.readFileSync(fullPath));
    }
  }
}

function streamFileWithRange(req: express.Request, res: express.Response, filePath: string, downloadFilename: string, contentType: string, sha256?: string) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const baseHeaders: Record<string, string | number> = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${downloadFilename}"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
  if (sha256) {
    baseHeaders['X-Checksum-SHA256'] = sha256;
  }

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
      return;
    }
    const chunksize = end - start + 1;
    res.writeHead(206, {
      ...baseHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunksize,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      ...baseHeaders,
      'Content-Length': fileSize,
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. Version Manifest Endpoint
  app.get(['/api/version', '/api/updates/manifest'], async (_req, res) => {
    try {
      const manifest = await getHydratedManifest();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(manifest);
    } catch (err: any) {
      res.status(500).json({ error: 'MANIFEST_READ_ERROR', message: err?.message || 'Failed to read version manifest' });
    }
  });

  // 2. Continuous Update Check Endpoint (compares installed versionCode with published release)
  app.get('/api/updates/check', async (req, res) => {
    try {
      const manifest = await getHydratedManifest();
      const rawCode = req.query.currentVersionCode;
      const currentVersionCode = typeof rawCode === 'string' ? parseInt(rawCode, 10) : NaN;
      const currentVersion = typeof req.query.currentVersion === 'string' ? req.query.currentVersion : null;

      if (Number.isNaN(currentVersionCode)) {
        res.status(400).json({ error: 'INVALID_VERSION_CODE', message: 'currentVersionCode query parameter is required.' });
        return;
      }

      const updateAvailable = manifest.latestVersionCode > currentVersionCode;
      const belowMinSupported = currentVersionCode < manifest.minSupportedVersionCode;
      const mandatoryUpdate = updateAvailable && (Boolean(manifest.mandatoryUpdate) || belowMinSupported);

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        checkedAt: new Date().toISOString(),
        appId: manifest.appId,
        currentVersion,
        currentVersionCode,
        latestVersion: manifest.latestVersion,
        latestVersionCode: manifest.latestVersionCode,
        minSupportedVersion: manifest.minSupportedVersion,
        minSupportedVersionCode: manifest.minSupportedVersionCode,
        updateAvailable,
        mandatoryUpdate,
        belowMinSupported,
        releaseDate: manifest.releaseDate,
        releaseNotes: manifest.releaseNotes,
        apkAvailable: manifest.apkAvailable,
        apkFileName: manifest.apkFileName,
        apkDownloadUrl: manifest.apkDownloadUrl,
        sha256: manifest.sha256,
        fileSizeBytes: manifest.fileSizeBytes,
        androidProjectZipUrl: manifest.androidProjectZipUrl,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'UPDATE_CHECK_ERROR', message: err?.message || 'Update check failed' });
    }
  });

  // 3. Direct APK Download Endpoint (supports HTTP Range + SHA-256 header)
  app.get(['/api/download/apk', '/api/download/apk/:variant'], async (req, res) => {
    try {
      const variantParam = req.params.variant === 'debug' ? 'debug' : 'release';
      const found = findCompiledApk(variantParam);

      if (found && (!req.params.variant || found.variant === variantParam)) {
        const { sha256 } = await computeFileSha256(found.path);
        streamFileWithRange(req, res, found.path, found.filename, 'application/vnd.android.package-archive', sha256);
        return;
      }

      const manifest = readRawManifest();
      if (manifest.apkDownloadUrl && manifest.apkDownloadUrl.startsWith('https://')) {
        res.redirect(302, manifest.apkDownloadUrl);
        return;
      }

      res.status(404).json({
        error: 'APK_NOT_COMPILED_ON_HOST',
        message: 'No compiled Android APK binary is present on this server yet. Download the Android Studio project bundle or run the Gradle/CI build pipeline to compile and publish the APK.',
        androidProjectZipUrl: '/api/download/android-project.zip',
        buildCommand: 'npm run build && npm run android:sync && cd android && ./gradlew assembleRelease',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'APK_DOWNLOAD_ERROR', message: err?.message || 'Failed to serve APK' });
    }
  });

  // 4. Complete Android Studio & GitHub-Ready Project Bundle ZIP Download
  app.get(['/api/download/android-project.zip', '/api/download/zip'], async (_req, res) => {
    try {
      const zip = new JSZip();
      const exclude = new Set([
        '.gradle',
        'build',
        'node_modules',
        '.DS_Store',
        'keystore.properties',
        'local.properties',
        'release-keystore.jks',
      ]);

      addDirectoryToZip(zip, path.resolve(__dirname, 'android'), 'android', exclude);
      addDirectoryToZip(zip, path.resolve(__dirname, 'src'), 'src', exclude);
      addDirectoryToZip(zip, path.resolve(__dirname, 'public'), 'public', exclude);
      addDirectoryToZip(zip, path.resolve(__dirname, '.github'), '.github', exclude);
      addDirectoryToZip(zip, path.resolve(__dirname, 'dist'), 'dist', exclude);

      const extraFiles = [
        '.gitignore',
        '.env.example',
        'package.json',
        'package-lock.json',
        'index.html',
        'tsconfig.json',
        'vite.config.ts',
        'metadata.json',
        'README.md',
        'capacitor.config.json',
        'ANDROID_BUILD_AND_RELEASE_GUIDE.md',
        'releases/version-manifest.json',
        'scripts/build-android.sh',
        'scripts/sync-android-assets.mjs',
        'scripts/bump-version.mjs',
        'scripts/publish-release.mjs',
      ];
      for (const rel of extraFiles) {
        const full = path.resolve(__dirname, rel);
        if (fs.existsSync(full)) {
          zip.file(rel, fs.readFileSync(full));
        }
      }

      const compiledApk = findCompiledApk('release');
      if (compiledApk) {
        zip.file(`release/${compiledApk.filename}`, fs.readFileSync(compiledApk.path));
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const sha256 = crypto.createHash('sha256').update(zipBuffer).digest('hex');

      const manifest = readRawManifest();
      const filename = `haqq-allah-v${manifest.latestVersion}-android-github-project.zip`;

      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Length': zipBuffer.length,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Checksum-SHA256': sha256,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(zipBuffer);
    } catch (err: any) {
      res.status(500).json({ error: 'ZIP_GENERATION_ERROR', message: err?.message || 'Failed to build Android project bundle' });
    }
  });

  // 4.5 Verify real GitHub Releases APK download links for a given owner/repo
  app.get('/api/github/release-status', async (req, res) => {
    const rawRepo = String(req.query.repo || '').trim();
    const cleaned = rawRepo
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '');

    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cleaned)) {
      res.status(400).json({
        error: 'INVALID_REPO',
        message: 'يرجى إدخال اسم المستودع بصيغة: username/repo',
      });
      return;
    }

    try {
      const ghRes = await fetch(`https://api.github.com/repos/${cleaned}/releases`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'HaqqAllah-Updater',
        },
      });

      if (ghRes.status === 404) {
        res.status(404).json({
          error: 'REPO_NOT_FOUND',
          repo: cleaned,
          message: `لم يتم العثور على المستودع (${cleaned}) أو أنه مستودع خاص.`,
        });
        return;
      }

      if (!ghRes.ok) {
        res.status(ghRes.status).json({
          error: 'GITHUB_API_ERROR',
          message: `تعذر الوصول إلى GitHub API (رمز الحالة ${ghRes.status})`,
        });
        return;
      }

      const releases = (await ghRes.json()) as Array<{
        tag_name: string;
        name: string;
        html_url: string;
        published_at: string;
        assets: Array<{
          name: string;
          size: number;
          browser_download_url: string;
        }>;
      }>;

      const releasesWithApks = releases
        .map((rel) => ({
          tagName: rel.tag_name,
          name: rel.name,
          releasePageUrl: rel.html_url,
          publishedAt: rel.published_at,
          apkAssets: (rel.assets || [])
            .filter((a) => a.name.toLowerCase().endsWith('.apk'))
            .map((a) => ({
              name: a.name,
              sizeBytes: a.size,
              downloadUrl: a.browser_download_url,
            })),
        }))
        .filter((rel) => rel.apkAssets.length > 0);

      res.json({
        repo: cleaned,
        repoUrl: `https://github.com/${cleaned}`,
        actionsUrl: `https://github.com/${cleaned}/actions`,
        releasesPageUrl: `https://github.com/${cleaned}/releases`,
        hasApkRelease: releasesWithApks.length > 0,
        latestRelease: releasesWithApks[0] || null,
        releases: releasesWithApks,
      });
    } catch (err: any) {
      res.status(502).json({
        error: 'GITHUB_FETCH_FAILED',
        message: err?.message || 'فشل الاتصال بـ GitHub API.',
      });
    }
  });

  // 5. Release Manifest Publish Endpoint (for CI/CD or authenticated release automation)
  app.post('/api/releases/publish', async (req, res) => {
    const configuredToken = process.env.RELEASE_PUBLISH_TOKEN;
    if (!configuredToken) {
      res.status(403).json({
        error: 'PUBLISH_TOKEN_NOT_CONFIGURED',
        message: 'Set RELEASE_PUBLISH_TOKEN on the server to enable remote manifest publishing, or run npm run release:publish locally.',
      });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const providedToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!providedToken || providedToken !== configuredToken) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid release publish token.' });
      return;
    }

    try {
      const current = readRawManifest();
      const body = req.body || {};
      const nextCode = Number(body.latestVersionCode);
      const nextVersion = String(body.latestVersion || '').trim();

      if (!nextVersion || Number.isNaN(nextCode) || nextCode <= current.latestVersionCode) {
        res.status(400).json({
          error: 'INVALID_VERSION_INCREMENT',
          message: `latestVersionCode must be strictly greater than current (${current.latestVersionCode}).`,
        });
        return;
      }

      const updated: ReleaseManifest = {
        ...current,
        latestVersion: nextVersion,
        latestVersionCode: nextCode,
        minSupportedVersion: body.minSupportedVersion || current.minSupportedVersion,
        minSupportedVersionCode: body.minSupportedVersionCode ?? current.minSupportedVersionCode,
        mandatoryUpdate: Boolean(body.mandatoryUpdate),
        releaseDate: body.releaseDate || new Date().toISOString().slice(0, 10),
        apkFileName: body.apkFileName || `haqq-allah-v${nextVersion}-release.apk`,
        apkDownloadUrl: body.apkDownloadUrl || current.apkDownloadUrl,
        sha256: body.sha256 || null,
        fileSizeBytes: Number(body.fileSizeBytes || 0),
        apkAvailable: Boolean(body.apkDownloadUrl?.startsWith('https://') && body.sha256),
        releaseNotes: Array.isArray(body.releaseNotes) ? body.releaseNotes : current.releaseNotes,
        history: [
          {
            version: nextVersion,
            versionCode: nextCode,
            releaseDate: body.releaseDate || new Date().toISOString().slice(0, 10),
            mandatory: Boolean(body.mandatoryUpdate),
            notes: Array.isArray(body.releaseNotes) ? body.releaseNotes : current.releaseNotes,
          },
          ...(current.history || []),
        ],
      };

      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
      res.json({ status: 'published', manifest: await getHydratedManifest() });
    } catch (err: any) {
      res.status(500).json({ error: 'PUBLISH_ERROR', message: err?.message || 'Failed to publish release manifest' });
    }
  });

  // Mount Vite middleware in development, or serve built dist/ in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Haqq Allah server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
