import React, { useState, useEffect } from 'react';
import { Download, Check, Volume2, Search, X, Loader2, Sparkles, HardDrive } from 'lucide-react';
import { ALL_SURAHS } from '../data/islamicData';
import { RECITERS_CATALOG, ReciterInfo, quranAudio } from '../services/quranAudioService';

interface RecitersLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReciterId: string;
  onSelectReciter: (reciterId: string) => void;
  currentSurahNumber: number;
}

export const RecitersLibraryModal: React.FC<RecitersLibraryModalProps> = ({
  isOpen,
  onClose,
  activeReciterId,
  onSelectReciter,
  currentSurahNumber,
}) => {
  const [selectedSurah, setSelectedSurah] = useState<number>(currentSurahNumber);
  const [downloadingReciter, setDownloadingReciter] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [cachedStatus, setCachedStatus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const surahInfo = ALL_SURAHS.find((s) => s.number === selectedSurah) || ALL_SURAHS[0];

  useEffect(() => {
    if (isOpen) {
      // Check cache status for current surah across reciters
      RECITERS_CATALOG.forEach(async (r) => {
        const isCached = await quranAudio.isSurahCached(selectedSurah, r.id);
        setCachedStatus((prev) => ({ ...prev, [r.id]: isCached }));
      });
    }
  }, [isOpen, selectedSurah]);

  if (!isOpen) return null;

  const handleDownloadSurah = async (reciter: ReciterInfo) => {
    setDownloadingReciter(reciter.id);
    setDownloadProgress(0);

    const success = await quranAudio.cacheSurahAudio(
      selectedSurah,
      surahInfo.versesCount,
      reciter.id,
      (percent) => {
        setDownloadProgress(percent);
      }
    );

    setDownloadingReciter(null);
    if (success) {
      setCachedStatus((prev) => ({ ...prev, [reciter.id]: true }));
    }
  };

  const filteredReciters = RECITERS_CATALOG.filter((r) =>
    r.nameAr.includes(searchQuery) || r.style.includes(searchQuery)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-gradient-to-b from-[#0c241d] via-[#071914] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base text-amber-300">
                مكتبة القراء والتنزيل
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                تصفح أصوات كبار القراء وتنزيل التلاوات للتشغيل بدون إنترنت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Surah Selector Banner */}
        <div className="my-3 p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-emerald-400/70 block">السورة المحددة للتنزيل:</span>
            <span className="font-serif font-black text-sm text-white">
              {surahInfo.nameAr} ({surahInfo.versesCount} آية)
            </span>
          </div>

          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-xl bg-[#0e3025] border border-emerald-400/40 text-amber-300 text-xs font-serif font-bold focus:outline-none"
          >
            {ALL_SURAHS.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.nameAr}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم القارئ أو الرواية..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-black/30 border border-emerald-500/30 text-white text-xs placeholder:text-emerald-400/50 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Reciters List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {filteredReciters.map((reciter) => {
            const isSelected = activeReciterId === reciter.id;
            const isDownloading = downloadingReciter === reciter.id;
            const isCached = cachedStatus[reciter.id];

            return (
              <div
                key={reciter.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#12382c] border-amber-400/70 shadow-lg'
                    : 'bg-black/30 border-emerald-500/20 hover:border-emerald-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-right">
                    <button
                      onClick={() => onSelectReciter(reciter.id)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-emerald-300'
                      }`}
                      title={isSelected ? 'القارئ الحالي المختار' : 'اختيار القارئ'}
                    >
                      {isSelected ? <Check className="w-5 h-5" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-black text-sm text-white">
                          {reciter.nameAr}
                        </h4>
                        {isCached && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                            <HardDrive className="w-2.5 h-2.5" />
                            محفوظة أوفلاين
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-300/70 flex items-center gap-2 mt-0.5">
                        <span>{reciter.style}</span>
                        <span>•</span>
                        <span className="font-mono">{reciter.bitrate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div>
                    {isDownloading ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{downloadProgress}%</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadSurah(reciter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-serif flex items-center gap-1.5 transition-all ${
                          isCached
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-400/40'
                        }`}
                        title="تنزيل تلاوة هذه السورة للاستماع بدون إنترنت"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isCached ? 'إعادة تنزيل' : 'تنزيل أوفلاين'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isDownloading && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-500/20">
                    <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-1.5 transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-amber-300/80 block mt-1 text-center font-mono">
                      جاري حفظ ملفات الآيات في الذاكرة المحلية للتطبيق...
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-emerald-500/20 text-center">
          <p className="text-[11px] text-emerald-300/80 font-serif">
            جميع التلاوات مأخوذة من خوادم EveryAyah العالمية الموثوقة بصوت نقي متقن.
          </p>
        </div>
      </div>
    </div>
  );
};
