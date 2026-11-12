import React, { useState } from 'react';
import {
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Smartphone,
  Info,
  RefreshCw,
} from 'lucide-react';
import { DownloadProgressState, UpdateCheckResult } from '../types/update';
import {
  dismissOptionalUpdate,
  downloadWithVerification,
  formatBytes,
  getInstalledAppInfo,
} from '../services/updateService';

interface UpdateNotificationModalProps {
  isOpen: boolean;
  updateResult: UpdateCheckResult | null;
  onClose: () => void;
  onOpenDownloadPage: () => void;
}

export const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({
  isOpen,
  updateResult,
  onClose,
  onOpenDownloadPage,
}) => {
  const [downloadState, setDownloadState] = useState<DownloadProgressState>({
    status: 'idle',
    downloadedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen || !updateResult) return null;

  const installed = getInstalledAppInfo();
  const isMandatory = updateResult.mandatoryUpdate;

  const handleDownloadUpdate = async () => {
    if (!updateResult.apkAvailable) {
      onOpenDownloadPage();
      return;
    }

    await downloadWithVerification({
      url: updateResult.apkDownloadUrl,
      filename: updateResult.apkFileName || `haqq-allah-v${updateResult.latestVersion}-release.apk`,
      expectedSha256: updateResult.sha256,
      preferNativeInstall: installed.isNativeAndroid,
      onProgress: setDownloadState,
    });
  };

  const handleUpdateLater = () => {
    if (isMandatory) return;
    dismissOptionalUpdate(updateResult.latestVersionCode);
    onClose();
  };

  const isBusy =
    downloadState.status === 'connecting' ||
    downloadState.status === 'downloading' ||
    downloadState.status === 'verifying';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#071913] border border-emerald-500/35 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-emerald-500/20 flex items-start justify-between gap-3 bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isMandatory
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              }`}
            >
              {isMandatory ? <AlertTriangle className="w-6 h-6" /> : <Download className="w-6 h-6" />}
            </div>
            <div>
              <h2 id="update-modal-title" className="font-serif font-bold text-lg text-white">
                {isMandatory ? 'تحديث إلزامي مطلوب' : 'يتوفر إصدار جديد من تطبيق حق الله'}
              </h2>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {isMandatory
                  ? 'إصدارك الحالي لم يعد مدعوماً، يرجى التحديث للمتابعة بأمان.'
                  : 'يمكنك التحديث الآن مع الحفاظ الكامل على بياناتك وإعداداتك.'}
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={handleUpdateLater}
              aria-label="إغلاق"
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Version Comparison Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-emerald-300/70 block">الإصدار المثبت حالياً</span>
              <span className="font-mono tabular-nums font-bold text-base text-white mt-1 block">
                v{installed.versionName} ({installed.versionCode})
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-400/40">
              <span className="text-[11px] text-amber-300/90 block">أحدث إصدار متاح</span>
              <span className="font-mono tabular-nums font-bold text-base text-amber-300 mt-1 block">
                v{updateResult.latestVersion} ({updateResult.latestVersionCode})
              </span>
            </div>
          </div>

          {/* Release Metadata (clean unboxed text with separators) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200/80 tabular-nums">
            <span>تاريخ الإصدار: {updateResult.releaseDate}</span>
            <span aria-hidden="true">·</span>
            <span>
              الحجم: {updateResult.fileSizeBytes > 0 ? formatBytes(updateResult.fileSizeBytes) : 'يُحدد بعد البناء'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{isMandatory ? 'تحديث إلزامي' : 'تحديث اختياري'}</span>
          </div>

          {/* What's New Section */}
          <div className="p-4 rounded-2xl bg-black/35 border border-emerald-500/20 space-y-2.5">
            <h3 className="font-serif font-bold text-sm text-white">ما الجديد في هذا الإصدار</h3>
            <ul className="space-y-1.5 text-xs text-emerald-100/90 leading-relaxed list-disc pr-4">
              {updateResult.releaseNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>

          {/* SHA-256 Integrity Notice */}
          {updateResult.sha256 && (
            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>التحقق التشفيري المدمج (SHA-256)</span>
              </div>
              <p className="font-mono text-[11px] text-amber-200/85 break-all tabular-nums">
                {updateResult.sha256}
              </p>
            </div>
          )}

          {/* Download Progress Indicator */}
          {downloadState.status !== 'idle' && (
            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-400/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  {downloadState.status === 'connecting' && 'جاري الاتصال بخادم التوزيع الآمن...'}
                  {downloadState.status === 'downloading' && 'جاري تنزيل حزمة التحديث...'}
                  {downloadState.status === 'verifying' && 'جاري فحص سلامة الملف ببصمة SHA-256...'}
                  {downloadState.status === 'verified' && 'تم التحقق من سلامة الملف بنجاح'}
                  {downloadState.status === 'ready' && 'تم التحقق بنجاح وفتح شاشة التثبيت الرسمية'}
                  {downloadState.status === 'needs_permission' && 'يلزم السماح بتثبيت التحديث من هذا المصدر (Android 8+)'}
                  {downloadState.status === 'error' && 'تعذر إكمال التحديث'}
                </span>
                <span className="font-mono tabular-nums font-bold text-amber-300">
                  {downloadState.percent}%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    downloadState.status === 'error' ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(4, downloadState.percent)}%` }}
                />
              </div>

              {downloadState.totalBytes > 0 && (
                <div className="text-[11px] text-emerald-200/75 font-mono tabular-nums">
                  {formatBytes(downloadState.downloadedBytes)} / {formatBytes(downloadState.totalBytes)}
                </div>
              )}

              {downloadState.status === 'verified' && (
                <div className="flex items-start gap-2 text-xs text-emerald-300 pt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    تم تنزيل ملف APK والتحقق من تطابق SHA-256. افتح الملف من إشعارات أو تنزيلات الهاتف لتثبيت التحديث فوق النسخة الحالية.
                  </span>
                </div>
              )}

              {downloadState.status === 'needs_permission' && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-amber-200">
                    في نظام Android 8 والأحدث، يجب منح صلاحية «التثبيت من هذا المصدر» مرة واحدة قبل ظهور نافذة التثبيت الرسمية.
                  </p>
                  <button
                    onClick={() => window.AndroidNative?.openInstallPermissionSettings?.()}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                  >
                    فتح إعدادات إذن التثبيت الآن
                  </button>
                </div>
              )}

              {downloadState.status === 'error' && (
                <p className="text-xs text-red-300">{downloadState.errorMessage}</p>
              )}
            </div>
          )}

          {/* Install Instructions Toggle */}
          <div className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions((prev) => !prev)}
              className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-emerald-200 hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>تعليمات التثبيت والحفاظ على البيانات (Android 8+)</span>
              </span>
              <span>{showInstructions ? 'إخفاء' : 'عرض'}</span>
            </button>
            {showInstructions && (
              <div className="px-4 pb-3.5 pt-1 text-xs text-stone-300 space-y-1.5 leading-relaxed border-t border-white/10">
                <p>1. لا تقم بحذف التطبيق الحالي؛ التثبيت فوق النسخة المثبتة يحفظ صلواتك وأذكارك وإعداداتك.</p>
                <p>2. عند طلب النظام على Android 8+، فعّل خيار «السماح من هذا المصدر» لتثبيت التحديث.</p>
                <p>3. اضغط «تحديث» في نافذة مثبت الحزم الرسمي للنظام (Package Installer).</p>
              </div>
            )}
          </div>

          {/* Data Preservation Assurance */}
          <div className="flex items-start gap-2 text-[11px] text-emerald-200/80">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              يستخدم التحديث نفس معرف الحزمة ({installed.applicationId}) ونفس شهادة التوقيع لضمان بقاء جميع سجلاتك دون فقدان.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-emerald-500/20 bg-black/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={handleDownloadUpdate}
            disabled={isBusy}
            className="flex-1 min-h-[46px] py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            {isBusy ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التجهيز...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{updateResult.apkAvailable ? 'تنزيل التحديث الآن' : 'فتح صفحة التنزيل والبناء'}</span>
              </>
            )}
          </button>

          {!isMandatory && (
            <button
              onClick={handleUpdateLater}
              disabled={isBusy}
              className="min-h-[46px] py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>التحديث لاحقاً</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
