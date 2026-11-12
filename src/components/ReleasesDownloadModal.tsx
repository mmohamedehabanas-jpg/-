import React from 'react';
import { X } from 'lucide-react';
import { UpdateCheckResult } from '../types/update';
import { DownloadDistributionPage } from './DownloadDistributionPage';

interface ReleasesDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateModal?: (result: UpdateCheckResult) => void;
}

export const ReleasesDownloadModal: React.FC<ReleasesDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenUpdateModal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#071913] border border-emerald-500/30 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/40">
          <div>
            <h2 className="font-serif font-black text-lg text-white">
              مركز توزيع وتحديثات تطبيق حق الله
            </h2>
            <p className="text-xs text-emerald-300/75 mt-0.5">
              تنزيل حزمة الأندرويد، التحقق من التحديثات، ومشاركة رابط التطبيق
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <DownloadDistributionPage
            embeddedInModal
            onOpenUpdateModal={(res) => {
              onClose();
              onOpenUpdateModal?.(res);
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-emerald-500/20 flex items-center justify-end bg-black/40">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
