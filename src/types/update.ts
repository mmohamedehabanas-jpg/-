export interface ReleaseHistoryEntry {
  version: string;
  versionCode: number;
  releaseDate: string;
  mandatory?: boolean;
  notes: string[];
}

export interface ReleaseManifest {
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
  history?: ReleaseHistoryEntry[];
  androidProjectZipUrl?: string;
  availableVariants?: {
    release: boolean;
    debug: boolean;
  };
}

export interface UpdateCheckResult {
  checkedAt: string;
  appId: string;
  currentVersion: string | null;
  currentVersionCode: number;
  latestVersion: string;
  latestVersionCode: number;
  minSupportedVersion: string;
  minSupportedVersionCode: number;
  updateAvailable: boolean;
  mandatoryUpdate: boolean;
  belowMinSupported: boolean;
  releaseDate: string;
  releaseNotes: string[];
  apkAvailable: boolean;
  apkFileName: string;
  apkDownloadUrl: string;
  sha256: string | null;
  fileSizeBytes: number;
  androidProjectZipUrl?: string;
}

export interface InstalledAppInfo {
  isNativeAndroid: boolean;
  applicationId: string;
  versionName: string;
  versionCode: number;
  sdkInt?: number;
  canRequestPackageInstalls?: boolean;
  updateManifestUrl: string;
  distributionPageUrl: string;
}

export interface DownloadProgressState {
  status: 'idle' | 'connecting' | 'downloading' | 'verifying' | 'verified' | 'needs_permission' | 'ready' | 'error';
  downloadedBytes: number;
  totalBytes: number;
  percent: number;
  computedSha256?: string;
  sha256Matched?: boolean;
  errorMessage?: string;
}

declare global {
  interface Window {
    AndroidNative?: {
      getAppInfoJson?: () => string;
      canRequestPackageInstalls?: () => boolean;
      openInstallPermissionSettings?: () => void;
      downloadAndInstallUpdate?: (apkUrl: string, expectedSha256: string | null) => void;
      shareAppLink?: (title: string, text: string, url: string) => void;
      openExternalUrl?: (url: string) => void;
      setImmersive?: (enabled: boolean) => void;
      scheduleExactAthan?: (prayerName: string, triggerTimeMillis: number) => void;
      startAthanService?: (prayerName: string) => void;
      stopAthanService?: () => void;
      updateAppWidget?: (nextPrayerName: string, countdownText: string, hijriDate: string, city: string) => void;
    };
  }
}
