import { APP_ID, APP_VERSION_CODE, APP_VERSION_NAME } from '../config/version';
import {
  DownloadProgressState,
  InstalledAppInfo,
  ReleaseManifest,
  UpdateCheckResult,
} from '../types/update';

const LAST_CHECK_KEY = 'haqq_allah_last_update_check_ts';
const DISMISSED_VERSION_KEY = 'haqq_allah_dismissed_version_code';

export function getInstalledAppInfo(): InstalledAppInfo {
  if (typeof window !== 'undefined' && window.AndroidNative?.getAppInfoJson) {
    try {
      const raw = window.AndroidNative.getAppInfoJson();
      const parsed = JSON.parse(raw);
      return {
        isNativeAndroid: true,
        applicationId: parsed.applicationId || APP_ID,
        versionName: parsed.versionName || APP_VERSION_NAME,
        versionCode: Number(parsed.versionCode || APP_VERSION_CODE),
        sdkInt: parsed.sdkInt,
        canRequestPackageInstalls: Boolean(parsed.canRequestPackageInstalls),
        updateManifestUrl: parsed.updateManifestUrl || '/api/version',
        distributionPageUrl: parsed.distributionPageUrl || `${window.location.origin}/download`,
      };
    } catch {
      // Fallback to bundled web constants
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    isNativeAndroid: false,
    applicationId: APP_ID,
    versionName: APP_VERSION_NAME,
    versionCode: APP_VERSION_CODE,
    updateManifestUrl: '/api/version',
    distributionPageUrl: `${origin}/download`,
  };
}

export function getShareableDownloadUrl(): string {
  if (typeof window === 'undefined') return '/download';
  const info = getInstalledAppInfo();
  if (info.isNativeAndroid && info.distributionPageUrl.startsWith('http')) {
    return info.distributionPageUrl;
  }
  return `${window.location.origin}/download`;
}

export async function fetchReleaseManifest(): Promise<ReleaseManifest> {
  const res = await fetch('/api/version', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`فشل جلب بيانات الإصدار (${res.status})`);
  }
  return res.json();
}

export async function checkForAppUpdates(options?: {
  overrideVersionCode?: number;
  overrideVersionName?: string;
}): Promise<UpdateCheckResult> {
  const installed = getInstalledAppInfo();
  const code = options?.overrideVersionCode ?? installed.versionCode;
  const verName = options?.overrideVersionName ?? installed.versionName;

  const baseUrl =
    installed.isNativeAndroid && installed.updateManifestUrl.startsWith('http')
      ? installed.updateManifestUrl.replace(/\/api\/version$/, '/api/updates/check')
      : '/api/updates/check';

  const params = new URLSearchParams({
    currentVersionCode: String(code),
    currentVersion: verName,
  });

  const res = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`تعذر التحقق من التحديثات (${res.status})`);
  }

  const data: UpdateCheckResult = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
  }
  return data;
}

export function getLastUpdateCheckTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(LAST_CHECK_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function isOptionalUpdateDismissed(versionCode: number): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISSED_VERSION_KEY);
  return raw ? parseInt(raw, 10) === versionCode : false;
}

export function dismissOptionalUpdate(versionCode: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISSED_VERSION_KEY, String(versionCode));
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

async function computeArrayBufferSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Downloads an APK or bundle with real progress tracking and SHA-256 verification.
 * On native Android WebView, delegates to UpdateManager.kt for native verified installation.
 */
export async function downloadWithVerification(params: {
  url: string;
  filename: string;
  expectedSha256?: string | null;
  preferNativeInstall?: boolean;
  onProgress: (state: DownloadProgressState) => void;
}): Promise<void> {
  const { url, filename, expectedSha256, preferNativeInstall, onProgress } = params;

  // 1. Native Android Verified In-App Update Flow
  if (preferNativeInstall && typeof window !== 'undefined' && window.AndroidNative?.downloadAndInstallUpdate) {
    const resolvedUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const progressHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      onProgress({
        status: detail.stage === 'verifying' ? 'verifying' : 'downloading',
        downloadedBytes: detail.downloadedBytes || 0,
        totalBytes: detail.totalBytes || 0,
        percent: detail.percent || 0,
      });
    };
    const completeHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      window.removeEventListener('haqqallah:update-progress', progressHandler);
      window.removeEventListener('haqqallah:update-complete', completeHandler);

      if (!detail.success) {
        onProgress({
          status: 'error',
          downloadedBytes: 0,
          totalBytes: 0,
          percent: 0,
          computedSha256: detail.sha256 || undefined,
          errorMessage: detail.message || 'فشل تنزيل التحديث أو التحقق منه.',
        });
        return;
      }

      onProgress({
        status: detail.needsInstallPermission ? 'needs_permission' : 'ready',
        downloadedBytes: 0,
        totalBytes: 0,
        percent: 100,
        computedSha256: detail.sha256 || undefined,
        sha256Matched: true,
      });
    };

    window.addEventListener('haqqallah:update-progress', progressHandler);
    window.addEventListener('haqqallah:update-complete', completeHandler);
    onProgress({ status: 'connecting', downloadedBytes: 0, totalBytes: 0, percent: 0 });
    window.AndroidNative.downloadAndInstallUpdate(resolvedUrl, expectedSha256 || null);
    return;
  }

  // 2. Web / Mobile Browser Streaming Download + WebCrypto SHA-256 Verification
  try {
    onProgress({ status: 'connecting', downloadedBytes: 0, totalBytes: 0, percent: 0 });

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      let msg = `فشل التنزيل (رمز الحالة ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson?.message) msg = errJson.message;
      } catch {
        // Ignore JSON parse failure
      }
      onProgress({
        status: 'error',
        downloadedBytes: 0,
        totalBytes: 0,
        percent: 0,
        errorMessage: msg,
      });
      return;
    }

    const headerSha = response.headers.get('X-Checksum-SHA256');
    const targetSha = expectedSha256 || headerSha || null;
    const totalBytes = Number(response.headers.get('Content-Length') || 0);

    const reader = response.body?.getReader();
    let buffer: ArrayBuffer;

    if (reader) {
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          const percent = totalBytes > 0 ? Math.min(99, Math.round((received / totalBytes) * 100)) : 0;
          onProgress({
            status: 'downloading',
            downloadedBytes: received,
            totalBytes,
            percent,
          });
        }
      }

      const merged = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      buffer = merged.buffer;
    } else {
      buffer = await response.arrayBuffer();
    }

    onProgress({
      status: 'verifying',
      downloadedBytes: buffer.byteLength,
      totalBytes: totalBytes || buffer.byteLength,
      percent: 100,
    });

    let computedSha256: string | undefined;
    let sha256Matched: boolean | undefined;

    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      computedSha256 = await computeArrayBufferSha256(buffer);
      if (targetSha) {
        sha256Matched = computedSha256.toLowerCase() === targetSha.trim().toLowerCase();
        if (!sha256Matched) {
          onProgress({
            status: 'error',
            downloadedBytes: buffer.byteLength,
            totalBytes: buffer.byteLength,
            percent: 0,
            computedSha256,
            sha256Matched: false,
            errorMessage: 'فشل التحقق التشفيري SHA-256! تم إلغاء حفظ الملف لحماية جهازك.',
          });
          return;
        }
      }
    }

    const mimeType = filename.endsWith('.apk')
      ? 'application/vnd.android.package-archive'
      : 'application/zip';
    const blob = new Blob([buffer], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);

    onProgress({
      status: 'verified',
      downloadedBytes: buffer.byteLength,
      totalBytes: totalBytes || buffer.byteLength,
      percent: 100,
      computedSha256,
      sha256Matched: sha256Matched ?? true,
    });
  } catch (err: any) {
    onProgress({
      status: 'error',
      downloadedBytes: 0,
      totalBytes: 0,
      percent: 0,
      errorMessage: err?.message || 'حدث خطأ أثناء التنزيل.',
    });
  }
}

export async function shareAppDownloadLink(versionName: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = getShareableDownloadUrl();
  const title = `تطبيق حق الله - الإصدار ${versionName}`;
  const text = `حمّل تطبيق حق الله (مواقيت الصلاة، المصحف الشريف، الأذكار، ومتابعة الصلوات) الإصدار ${versionName} للأندرويد:`;

  if (typeof window !== 'undefined' && window.AndroidNative?.shareAppLink) {
    window.AndroidNative.shareAppLink(title, text, url);
    return 'shared';
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch {
      // User cancelled or share unsupported, fallback to clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
