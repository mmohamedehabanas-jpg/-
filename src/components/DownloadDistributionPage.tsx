import React, { useEffect, useState } from 'react';
import {
  Download,
  Share2,
  ShieldCheck,
  Check,
  Copy,
  RefreshCw,
  Smartphone,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Terminal,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  DownloadProgressState,
  ReleaseManifest,
  UpdateCheckResult,
} from '../types/update';
import {
  checkForAppUpdates,
  downloadWithVerification,
  fetchReleaseManifest,
  formatBytes,
  getInstalledAppInfo,
  getShareableDownloadUrl,
  shareAppDownloadLink,
} from '../services/updateService';

interface DownloadDistributionPageProps {
  onBackToApp?: () => void;
  onOpenUpdateModal?: (result: UpdateCheckResult) => void;
  embeddedInModal?: boolean;
}

export const DownloadDistributionPage: React.FC<DownloadDistributionPageProps> = ({
  onBackToApp,
  onOpenUpdateModal,
  embeddedInModal = false,
}) => {
  const [manifest, setManifest] = useState<ReleaseManifest | null>(null);
  const [updateCheck, setUpdateCheck] = useState<UpdateCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadProgressState>({
    status: 'idle',
    downloadedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [githubRepoInput, setGithubRepoInput] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('haqq_allah_github_repo') || '';
  });
  const [githubStatus, setGithubStatus] = useState<{
    loading: boolean;
    error: string | null;
    data: {
      repo: string;
      repoUrl: string;
      actionsUrl: string;
      releasesPageUrl: string;
      hasApkRelease: boolean;
      latestRelease: {
        tagName: string;
        name: string;
        releasePageUrl: string;
        publishedAt: string;
        apkAssets: Array<{ name: string; sizeBytes: number; downloadUrl: string }>;
      } | null;
    } | null;
  }>({ loading: false, error: null, data: null });

  const handleCheckGithubRepo = async () => {
    const cleaned = githubRepoInput.trim();
    if (!cleaned) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('haqq_allah_github_repo', cleaned);
    }
    setGithubStatus({ loading: true, error: null, data: null });
    try {
      const res = await fetch(`/api/github/release-status?repo=${encodeURIComponent(cleaned)}`);
      const json = await res.json();
      if (!res.ok) {
        setGithubStatus({ loading: false, error: json?.message || 'تعذر فحص المستودع.', data: null });
        return;
      }
      setGithubStatus({ loading: false, error: null, data: json });
    } catch (err: any) {
      setGithubStatus({ loading: false, error: err?.message || 'فشل الاتصال بالخادم.', data: null });
    }
  };

  const installed = getInstalledAppInfo();
  const shareUrl = getShareableDownloadUrl();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [man, chk] = await Promise.all([
        fetchReleaseManifest(),
        checkForAppUpdates(),
      ]);
      setManifest(man);
      setUpdateCheck(chk);
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل بيانات الإصدار من الخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualUpdateCheck = async () => {
    setCheckingUpdate(true);
    try {
      const result = await checkForAppUpdates();
      setUpdateCheck(result);
      if (result.updateAvailable && onOpenUpdateModal) {
        onOpenUpdateModal(result);
      }
    } catch (err: any) {
      setError(err?.message || 'فشل التحقق من التحديثات.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadApk = async () => {
    if (!manifest || !manifest.apkAvailable) return;
    await downloadWithVerification({
      url: manifest.apkDownloadUrl,
      filename: manifest.apkFileName,
      expectedSha256: manifest.sha256,
      preferNativeInstall: installed.isNativeAndroid,
      onProgress: setDownloadState,
    });
  };

  const handleDownloadProjectBundle = async () => {
    if (!manifest) return;
    await downloadWithVerification({
      url: manifest.androidProjectZipUrl || '/api/download/android-project.zip',
      filename: `haqq-allah-v${manifest.latestVersion}-android-project.zip`,
      expectedSha256: null,
      preferNativeInstall: false,
      onProgress: setDownloadState,
    });
  };

  const handleShare = async () => {
    const versionLabel = manifest?.latestVersion || installed.versionName;
    const result = await shareAppDownloadLink(versionLabel);
    if (result === 'copied') {
      setShareFeedback('تم نسخ رابط التحميل لمشاركته مع الآخرين');
    } else if (result === 'shared') {
      setShareFeedback('تم فتح نافذة المشاركة');
    } else {
      setShareFeedback('تعذرت المشاركة التلقائية، يمكنك نسخ الرابط يدوياً أدناه');
    }
    setTimeout(() => setShareFeedback(null), 3500);
  };

  const handleCopySha = () => {
    if (!manifest?.sha256) return;
    navigator.clipboard.writeText(manifest.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShareFeedback('تم نسخ رابط صفحة التنزيل');
    setTimeout(() => setShareFeedback(null), 2500);
  };

  const isBusy =
    downloadState.status === 'connecting' ||
    downloadState.status === 'downloading' ||
    downloadState.status === 'verifying';

  return (
    <div className="space-y-4 text-white" dir="rtl">
      {/* Top Bar when viewed as standalone page */}
      {!embeddedInModal && onBackToApp && (
        <div className="flex items-center justify-between pt-1 pb-2">
          <button
            onClick={onBackToApp}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى التطبيق</span>
          </button>
          <span className="text-xs text-emerald-300/80 font-mono tabular-nums">
            {installed.applicationId}
          </span>
        </div>
      )}

      {/* Hero Distribution Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c3127] via-[#09241d] to-[#061914] border border-emerald-400/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img
              src="/pwa-192x192.png"
              alt="أيقونة تطبيق حق الله"
              className="w-14 h-14 rounded-2xl border border-amber-400/40 shadow-lg object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-serif font-black text-xl text-white">
                حق الله - Haqq Allah
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200/80 mt-1 tabular-nums">
                <span>الإصدار المنشور: v{manifest?.latestVersion || installed.versionName}</span>
                <span aria-hidden="true">·</span>
                <span>Code {manifest?.latestVersionCode ?? installed.versionCode}</span>
                {manifest?.releaseDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{manifest.releaseDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Version Status Banner */}
        {loading ? (
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-emerald-200 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>جاري التحقق من أحدث إصدار متاح...</span>
          </div>
        ) : error ? (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-400/40 text-xs text-red-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              onClick={loadData}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 font-bold shrink-0"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-emerald-300/70 block">النسخة المثبتة</span>
              <span className="text-xs font-mono tabular-nums font-bold text-white mt-0.5 block">
                v{installed.versionName} ({installed.versionCode})
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-emerald-300/70 block">أحدث نسخة</span>
              <span className="text-xs font-mono tabular-nums font-bold text-amber-300 mt-0.5 block">
                v{manifest?.latestVersion} ({manifest?.latestVersionCode})
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-emerald-300/70 block">حالة التحديث</span>
              <span className="text-xs font-bold text-emerald-300 mt-0.5 block">
                {updateCheck?.updateAvailable
                  ? updateCheck.mandatoryUpdate
                    ? 'تحديث إلزامي'
                    : 'تحديث متاح'
                  : 'محدّث لأحدث إصدار'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-emerald-300/70 block">التوافق</span>
              <span className="text-xs font-mono tabular-nums font-bold text-white mt-0.5 block">
                Android 8.0+
              </span>
            </div>
          </div>
        )}

        {/* Primary Download & Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {manifest?.apkAvailable ? (
            <button
              onClick={handleDownloadApk}
              disabled={isBusy}
              className="min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              {isBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>
                تنزيل APK ({formatBytes(manifest.fileSizeBytes)})
              </span>
            </button>
          ) : (
            <button
              onClick={handleDownloadProjectBundle}
              disabled={isBusy || !manifest}
              className="min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              {isBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
              <span>تنزيل مشروع Android Studio (.zip)</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="min-h-[48px] py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-amber-300" />
            <span>مشاركة رابط التطبيق</span>
          </button>
        </div>

        {/* Shareable Link Row */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/45 border border-emerald-500/20">
          <div className="overflow-hidden">
            <span className="text-[10px] text-emerald-300/70 block">رابط صفحة التنزيل المباشرة للمشاركة:</span>
            <span className="text-xs font-mono text-emerald-100 truncate block" dir="ltr">
              {shareUrl}
            </span>
          </div>
          <button
            onClick={handleCopyShareUrl}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ</span>
          </button>
        </div>

        {shareFeedback && (
          <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}
      </div>

      {/* Download Progress & Verification Card */}
      {downloadState.status !== 'idle' && (
        <div className="p-4 rounded-2xl bg-black/50 border border-emerald-400/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">
              {downloadState.status === 'connecting' && 'جاري الاتصال...'}
              {downloadState.status === 'downloading' && 'جاري التنزيل...'}
              {downloadState.status === 'verifying' && 'جاري فحص SHA-256...'}
              {downloadState.status === 'verified' && 'اكتمل التنزيل وتم التحقق من SHA-256'}
              {downloadState.status === 'ready' && 'جاهز للتثبيت على Android'}
              {downloadState.status === 'needs_permission' && 'يلزم تفعيل إذن التثبيت من هذا المصدر'}
              {downloadState.status === 'error' && 'حدث خطأ في التنزيل'}
            </span>
            <span className="font-mono tabular-nums font-bold text-amber-300">{downloadState.percent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                downloadState.status === 'error' ? 'bg-red-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.max(4, downloadState.percent)}%` }}
            />
          </div>
          {downloadState.computedSha256 && (
            <p className="text-[11px] font-mono text-emerald-300 break-all">
              SHA-256 المحسوبة: {downloadState.computedSha256}
            </p>
          )}
          {downloadState.status === 'error' && (
            <p className="text-xs text-red-300">{downloadState.errorMessage}</p>
          )}
        </div>
      )}

      {/* Honest APK Build Status Notice + GitHub Releases Connector */}
      {manifest && !manifest.apkAvailable && (
        <div className="p-4 rounded-3xl bg-amber-950/35 border border-amber-400/35 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Terminal className="w-4 h-4 shrink-0" />
            <span>حالة ملف APK الثنائي وبناء رابط GitHub المباشر</span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            هذا الخادم لا يحتوي على Android SDK لتجميع ملف <code className="font-mono">.apk</code> محلياً. حمّل حزمة المشروع الجاهزة بالأعلى (تتضمن ملف البناء التلقائي <code className="font-mono">.github/workflows/build_apk.yml</code>) وارفعها إلى مستودعك على GitHub ثم شغّل مسار البناء <code className="font-mono">Run workflow</code> لإصدار <code className="font-mono">v3.0.0</code> وإنتاج رابط تحميل APK مباشر.
          </p>

          {/* Real GitHub Releases Lookup */}
          <div className="p-3 rounded-2xl bg-black/45 border border-emerald-500/25 space-y-2.5">
            <label className="text-xs font-bold text-white block">
              التحقق من رابط تحميل APK على مستودع GitHub الخاص بك:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                dir="ltr"
                value={githubRepoInput}
                onChange={(e) => setGithubRepoInput(e.target.value)}
                placeholder="username/haqq-allah"
                className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/30 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleCheckGithubRepo}
                disabled={githubStatus.loading || !githubRepoInput.trim()}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
              >
                {githubStatus.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>فحص إصدارات GitHub</span>
              </button>
            </div>

            {githubStatus.error && (
              <p className="text-xs text-red-300">{githubStatus.error}</p>
            )}

            {githubStatus.data && (
              <div className="space-y-2 pt-1">
                {githubStatus.data.hasApkRelease && githubStatus.data.latestRelease ? (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300">
                        تم العثور على ملفات APK منشورة ({githubStatus.data.latestRelease.tagName})
                      </span>
                      <a
                        href={githubStatus.data.latestRelease.releasePageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <span>صفحة الإصدار</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {githubStatus.data.latestRelease.apkAssets.map((asset) => (
                      <div
                        key={asset.downloadUrl}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-white/10"
                      >
                        <div className="overflow-hidden">
                          <span className="font-mono text-xs text-white block truncate" dir="ltr">
                            {asset.name}
                          </span>
                          <span className="text-[11px] font-mono tabular-nums text-emerald-300/75">
                            {formatBytes(asset.sizeBytes)}
                          </span>
                        </div>
                        <a
                          href={asset.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل APK</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-black/50 border border-amber-400/30 text-xs text-amber-200 space-y-1">
                    <p>المستودع موجود، لكن لا توجد ملفات APK منشورة في Releases بعد.</p>
                    <a
                      href={githubStatus.data.actionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-300 hover:underline font-bold"
                    >
                      <span>افتح GitHub Actions لتشغيل البناء</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHA-256 Checksum & Update Check Controls */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>الأمان والتحقق من الحزمة</span>
          </div>
          <button
            onClick={handleManualUpdateCheck}
            disabled={checkingUpdate}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-400/40 text-xs font-bold text-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>فحص التحديثات الآن</span>
          </button>
        </div>

        {manifest?.sha256 ? (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/45 border border-emerald-500/25">
            <div className="overflow-hidden">
              <span className="text-[10px] text-emerald-300/70 block">بصمة SHA-256 لملف APK المنشور:</span>
              <span className="text-[11px] font-mono text-amber-200 truncate block">{manifest.sha256}</span>
            </div>
            <button
              onClick={handleCopySha}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
            >
              {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSha ? 'تم' : 'نسخ'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-stone-300 leading-relaxed">
            سيتم احتساب وعرض بصمة SHA-256 تلقائياً فور توفر ملف APK الموقع في الخادم، مع التحقق التلقائي قبل التثبيت على Android 8.0+.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100/85 pt-1">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
            <span className="font-bold text-white block mb-0.5">حفظ البيانات عند التحديث</span>
            <span>نفس معرف الحزمة ({manifest?.appId || installed.applicationId}) والتوقيع يحفظان بياناتك وإعداداتك دون حذف التطبيق.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
            <span className="font-bold text-white block mb-0.5">دعم Android 8+</span>
            <span>تثبيت آمن عبر FileProvider وموافقة المستخدم الصريحة عبر مثبت النظام الرسمي.</span>
          </div>
        </div>
      </div>

      {/* Changelog & Version History */}
      {manifest && (
        <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>سجل التغييرات والإصدارات (Changelog)</span>
            </h2>
            <span className="text-[11px] font-mono tabular-nums text-emerald-300/75">
              v{manifest.latestVersion}
            </span>
          </div>

          <ul className="space-y-1.5 text-xs text-emerald-100/90 list-disc pr-4 leading-relaxed">
            {manifest.releaseNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>

          {manifest.history && manifest.history.length > 1 && (
            <div className="pt-2 border-t border-emerald-500/15 space-y-2.5">
              <span className="text-xs font-bold text-emerald-300/80 block">الإصدارات السابقة</span>
              {manifest.history.slice(1).map((item) => (
                <div key={item.versionCode} className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold text-white">v{item.version} (Code {item.versionCode})</span>
                    <span className="text-emerald-300/70">{item.releaseDate}</span>
                  </div>
                  <ul className="text-[11px] text-stone-300 list-disc pr-4 space-y-0.5">
                    {item.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
