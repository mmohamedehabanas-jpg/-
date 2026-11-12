import React from 'react';
import { UserPreferences, PrayerTime } from '../types';

interface HomeWidgetCardProps {
  preferences: UserPreferences;
  prayerTimes?: PrayerTime[] | null;
  countdownFormatted: string;
  nextPrayerArabicName: string;
  nextPrayerTimeFormatted: string;
  onOpenAzkar?: () => void;
  onOpenApp?: () => void;
}

export const HomeWidgetCard: React.FC<HomeWidgetCardProps> = ({
  preferences,
  prayerTimes,
  countdownFormatted,
  nextPrayerArabicName,
  nextPrayerTimeFormatted,
  onOpenAzkar,
  onOpenApp,
}) => {
  // Arabic numeral helper
  const toArabicDigits = (str: string): string => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
  };

  const cityName = preferences.selectedCity?.cityNameAr || 'ميت غمر';

  const prayers = [
    { name: 'الفجر', time: prayerTimes?.find(p => p.type === 'FAJR')?.timeFormatted ? toArabicDigits(prayerTimes.find(p => p.type === 'FAJR')!.timeFormatted) : '٠٤:٤٦ ص' },
    { name: 'الظهر', time: prayerTimes?.find(p => p.type === 'DHUHR')?.timeFormatted ? toArabicDigits(prayerTimes.find(p => p.type === 'DHUHR')!.timeFormatted) : '١١:٣٩ ص' },
    { name: 'العصر', time: prayerTimes?.find(p => p.type === 'ASR')?.timeFormatted ? toArabicDigits(prayerTimes.find(p => p.type === 'ASR')!.timeFormatted) : '٠٢:٤٠ م' },
    { name: 'المغرب', time: prayerTimes?.find(p => p.type === 'MAGHRIB')?.timeFormatted ? toArabicDigits(prayerTimes.find(p => p.type === 'MAGHRIB')!.timeFormatted) : '٠٥:٠٢ م' },
    { name: 'العشاء', time: prayerTimes?.find(p => p.type === 'ISHA')?.timeFormatted ? toArabicDigits(prayerTimes.find(p => p.type === 'ISHA')!.timeFormatted) : '٠٦:٢٢ م' },
  ];

  return (
    <div
      onClick={onOpenApp}
      dir="rtl"
      className="relative w-full max-w-md mx-auto rounded-[32px] p-4 sm:p-5 text-white select-none transition-all duration-300 shadow-2xl border border-emerald-400/40 bg-gradient-to-b from-[#11382e]/95 via-[#0b2820]/95 to-[#071d17]/95 backdrop-blur-2xl cursor-pointer"
      style={{
        boxShadow: '0 20px 45px -10px rgba(6, 44, 34, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* 1. Top Header Row: حق الله 🕌 | 29 جمادى الأولى 1448 هـ | 📍 ميت غمر */}
      <div className="flex items-center justify-between pb-3 text-xs sm:text-sm font-serif">
        <div className="flex items-center gap-1.5 font-black text-amber-200">
          <span>حق الله</span>
          <span>🕌</span>
        </div>

        <div className="text-[11px] sm:text-xs text-emerald-200/90 font-bold">
          29 جمادى الأولى 1448 هـ
        </div>

        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-100 font-bold">
          <span className="text-red-500">📍</span>
          <span>{cityName}</span>
        </div>
      </div>

      {/* 2. Middle Section: Next Prayer & Framed Countdown + Azkar Button */}
      <div className="py-2.5 flex items-center justify-between gap-3">
        {/* Right side: Next prayer text */}
        <div className="space-y-0.5 text-right">
          <span className="text-xs text-emerald-200/80 font-medium block">
            متبقٍ على أذان:
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight drop-shadow">
            {nextPrayerArabicName || 'صلاة الفجر'}
          </h2>
          <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono block">
            الموعد: {toArabicDigits(nextPrayerTimeFormatted || '٠٤:٤٦ ص')}
          </span>
        </div>

        {/* Left side: Framed Countdown Box & Azkar Button */}
        <div className="flex items-center gap-2">
          {/* Framed Countdown Box */}
          <div className="px-3 py-2 rounded-2xl border border-emerald-400/40 bg-black/30 backdrop-blur-sm text-center">
            <span className="text-[10px] text-emerald-200/90 font-medium block">
              الوقت المتبقي
            </span>
            <span className="text-base sm:text-lg font-black font-mono tracking-wider text-white">
              {toArabicDigits(countdownFormatted || '٤:٠٧:٢٤')}
            </span>
          </div>

          {/* Quick Azkar Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenAzkar) onOpenAzkar();
            }}
            className="px-3 py-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-950/50 hover:bg-emerald-900/60 active:scale-95 transition-all text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
          >
            <span>الأذكار</span>
            <span className="text-amber-300">📿</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Row: 5 Prayer Cards with Borders */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-3 border-t border-emerald-500/20 mt-2">
        {prayers.map((p, idx) => (
          <div
            key={idx}
            className="py-1.5 px-1 rounded-xl border border-emerald-400/30 bg-black/25 text-center flex flex-col items-center justify-center space-y-0.5"
          >
            <span className="text-[11px] font-serif font-bold text-emerald-200">
              {p.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300">
              {p.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
