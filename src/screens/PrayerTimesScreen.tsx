import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  BookOpen,
  ChevronLeft,
  Volume2,
  VolumeX,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import {
  CityLocation,
  DailyPrayerRecord,
  PrayerName,
  PrayerTime,
  PRAYER_DEFINITIONS,
  UserPreferences
} from '../types';
import {
  calculatePrayerTimes,
  getNextUpcomingPrayer,
  getHijriDate
} from '../services/prayerCalculator';
import { SPIRITUAL_DATA, VOLUNTARY_SUNNAH_CATALOG } from '../data/islamicData';
import { audioService } from '../services/audioService';
import { QiblaCompassDialog } from '../components/QiblaCompassDialog';

interface PrayerTimesScreenProps {
  preferences: UserPreferences;
  dailyRecord: DailyPrayerRecord;
  onUpdateDailyRecord: (record: DailyPrayerRecord) => void;
  onNavigateToTab: (tab: 'prayers' | 'tracker' | 'azkar' | 'quran' | 'settings') => void;
  onTriggerLockdown: (prayerName: PrayerName) => void;
  onDetectGps: () => void;
  isGpsLoading: boolean;
}

export const PrayerTimesScreen: React.FC<PrayerTimesScreenProps> = ({
  preferences,
  dailyRecord,
  onUpdateDailyRecord,
  onNavigateToTab,
  onTriggerLockdown,
  onDetectGps,
  isGpsLoading,
}) => {
  const [showQibla, setShowQibla] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(audioService.isPlaying());

  useEffect(() => {
    return audioService.subscribe(setIsAdhanPlaying);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculationOpts = {
    latitude: preferences.selectedCity.latitude,
    longitude: preferences.selectedCity.longitude,
    timezoneOffsetHours: preferences.selectedCity.timezoneOffsetHours,
    isDaylightSaving: preferences.isDaylightSaving,
    manualOffsetMinutes: preferences.manualOffsetMinutes,
    methodId: preferences.calculationMethod,
    madhab: preferences.madhab,
  };

  const prayers = calculatePrayerTimes(currentTime, calculationOpts);
  const { nextPrayer, secondsRemaining, progressPercent } = getNextUpcomingPrayer(currentTime, calculationOpts);

  // Format countdown hh:mm:ss
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const countdownFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const hijri = getHijriDate(currentTime, preferences.hijriDateOffsetDays);
  const gregorianFormatted = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextPrayerType = nextPrayer.type;
  const spiritualDetail = SPIRITUAL_DATA[nextPrayerType] || SPIRITUAL_DATA.DHUHR;

  const toggleSunnah = (sunnahId: string) => {
    const cur = dailyRecord.voluntarySunnahDone[sunnahId] || false;
    onUpdateDailyRecord({
      ...dailyRecord,
      voluntarySunnahDone: {
        ...dailyRecord.voluntarySunnahDone,
        [sunnahId]: !cur,
      },
    });
  };

  const getPrayerIcon = (type: PrayerName) => {
    switch (type) {
      case 'FAJR':
        return <span className="text-xl">🌅</span>;
      case 'SUNRISE':
        return <span className="text-xl">☀️</span>;
      case 'DHUHR':
        return <span className="text-xl">☀️</span>;
      case 'ASR':
        return <span className="text-xl">🌤️</span>;
      case 'MAGHRIB':
        return <span className="text-xl">🌇</span>;
      case 'ISHA':
        return <span className="text-xl">🌙</span>;
    }
  };

  const cityShortName = preferences.selectedCity.cityNameAr.replace('مدينة ', '').slice(0, 10);

  return (
    <div className="space-y-4 pb-28 text-white select-none transition-all duration-300" dir="rtl">
      {/* 1. Header Bar: Location on left, App title on right */}
      <div className="flex items-center justify-between pt-1 pb-1">
          <button
            onClick={() => onNavigateToTab('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#122822]/90 hover:bg-[#18342c] border text-emerald-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            style={{ borderColor: 'var(--accent-border-subtle)' }}
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span>{cityShortName}</span>
          </button>

        {/* Title & Hijri Date */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <h1 className="font-serif font-black text-xl text-white tracking-wide">
              حق الله
            </h1>
            <div
              className="w-8 h-8 rounded-xl bg-emerald-800/80 border flex items-center justify-center font-serif font-bold text-base shadow-md transition-all"
              style={{
                borderColor: 'var(--accent-border)',
                boxShadow: '0 0 14px var(--accent-glow)',
              }}
            >
              {preferences.appIconStyle === 'kaaba' ? '🕋' :
               preferences.appIconStyle === 'quran' ? '📖' :
               preferences.appIconStyle === 'rug' ? '🧎' : '🕌'}
            </div>
          </div>
          <div className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
            {hijri.formatted} • {gregorianFormatted}
          </div>
        </div>
      </div>

      {/* 2. Quick Action Dual Cards: المصحف الشريف & اتجاه القبلة */}
      <div className="grid grid-cols-2 gap-3">
        {/* المصحف الشريف */}
        <button
          onClick={() => onNavigateToTab('quran')}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-[#0b241e]/90 hover:bg-[#0f2e26] border text-right transition-all shadow-xl shadow-black/40 flex items-center justify-between group active:scale-[0.98]"
          style={{
            borderColor: 'var(--accent-border)',
            boxShadow: '0 8px 25px -5px var(--accent-glow)',
          }}
        >
          <div className="relative z-10">
            <div className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              المصحف الشريف
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">مصحف مجمع الملك فهد</div>
          </div>
          <span className="text-2xl group-hover:scale-110 transition-transform relative z-10">📖</span>
          {/* Subtle gilded corner ornament */}
          <div
            className="absolute top-0 right-0 w-8 h-8 opacity-15 pointer-events-none rounded-bl-full"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />
        </button>

        {/* اتجاه القبلة */}
        <button
          onClick={() => setShowQibla(true)}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-[#0b241e]/90 hover:bg-[#0f2e26] border border-emerald-500/30 text-right transition-all shadow-xl shadow-black/40 flex items-center justify-between group active:scale-[0.98]"
          style={{ borderColor: 'var(--accent-border-subtle)' }}
        >
          <div className="relative z-10">
            <div className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              اتجاه القبلة
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">بوصلة تفاعلية حية</div>
          </div>
          <span className="text-2xl group-hover:rotate-45 transition-transform relative z-10">🧭</span>
        </button>
      </div>

      {/* 3. Hero Prayer Card: الصلاة القادمة (Ornate Islamic Arch Frame) */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c3127] via-[#09241d] to-[#061914] border p-5 shadow-2xl space-y-4 transition-all"
        style={{
          borderColor: 'var(--accent-border)',
          boxShadow: '0 16px 45px -10px var(--accent-glow), 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Subtle Decorative Mihrab Arch Watermark in Background */}
        <div className="absolute -top-12 -left-12 w-48 h-48 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white">
            <path d="M50 0 C25 25 15 50 15 95 L85 95 C85 50 75 25 50 0 Z" strokeWidth="2" />
            <path d="M50 10 C30 30 22 52 22 90 L78 90 C78 52 70 30 50 10 Z" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }} />
              <span className="text-[11px] font-bold block" style={{ color: 'var(--accent-color)' }}>
                الصلاة القادمة
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              صلاة {nextPrayer.arabicName}
            </h2>
          </div>

          <div
            className="px-4 py-2 rounded-2xl bg-black/40 border text-white font-mono text-base font-bold shadow-inner"
            style={{ borderColor: 'var(--accent-border-subtle)' }}
          >
            {nextPrayer.timeFormatted}
          </div>
        </div>

        {/* Countdown timer */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-200/80">متبقٍ على الأذان:</span>
            <span
              className="text-base font-black font-mono tracking-wider px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10"
              style={{ color: 'var(--accent-color)', textShadow: '0 0 10px var(--accent-glow)' }}
            >
              {countdownFormatted}
            </span>
          </div>

          <button
            onClick={() => {
              if (isAdhanPlaying) {
                audioService.stopAdhan();
              } else {
                audioService.playAdhan();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isAdhanPlaying
                ? 'animate-pulse text-black font-black'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
            style={
              isAdhanPlaying
                ? { backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-border)' }
                : { borderColor: 'var(--accent-border-subtle)', color: 'var(--accent-color)' }
            }
          >
            {isAdhanPlaying ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>إيقاف الأذان</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>سماع الأذان</span>
              </>
            )}
          </button>
        </div>

        {/* Glowing Progress Track */}
        <div className="relative z-10 w-full h-2 rounded-full bg-black/50 overflow-hidden flex p-0.5 border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, Math.max(12, progressPercent))}%`,
              background: 'var(--accent-gradient)',
              boxShadow: '0 0 15px var(--accent-glow)',
            }}
          />
        </div>
      </div>

      {/* 4. Section: مواقيت الصلوات الخمس */}
      <div className="space-y-2.5">
        <h3 className="font-serif font-black text-base text-white px-1 flex items-center justify-between">
          <span>مواقيت الصلوات الخمس</span>
          <span className="text-[11px] font-sans font-normal opacity-70">بحسب التوقيت الفلكي المحلي</span>
        </h3>

        <div className="space-y-2">
          {prayers.map((prayer) => {
            const isNext = prayer.type === nextPrayer.type;
            const isSunrise = prayer.type === 'SUNRISE';

            return (
              <div
                key={prayer.type}
                className={`p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                  isNext
                    ? 'bg-[#0f2f25] border-2 shadow-xl'
                    : 'bg-[#091f18]/90 border-emerald-500/20 hover:border-emerald-500/40'
                }`}
                style={
                  isNext
                    ? {
                        borderColor: 'var(--accent-border)',
                        boxShadow: '0 10px 30px -5px var(--accent-glow), 0 0 15px rgba(0,0,0,0.5)',
                      }
                    : undefined
                }
              >
                {/* Right: Icon + Name + Time */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-black/30 border border-emerald-500/20 flex items-center justify-center transition-transform hover:scale-105"
                    style={isNext ? { borderColor: 'var(--accent-border)' } : undefined}
                  >
                    {getPrayerIcon(prayer.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>صلاة {prayer.arabicName}</span>
                    </h4>
                    <span className="text-xs text-emerald-300/80 font-mono block mt-0.5">
                      {prayer.timeFormatted}
                    </span>
                  </div>
                </div>

                {/* Left: Status Pill */}
                <div>
                  {isNext ? (
                    <span
                      className="px-3.5 py-1 rounded-full border text-xs font-black shadow-md tracking-wide"
                      style={{
                        backgroundColor: 'var(--accent-bg-subtle)',
                        color: 'var(--accent-color)',
                        borderColor: 'var(--accent-border)',
                        boxShadow: '0 0 12px var(--accent-glow)',
                      }}
                    >
                      الصلاة القادمة
                    </span>
                  ) : isSunrise ? (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-amber-500/30 text-amber-200 text-xs font-medium">
                      الشروق
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-emerald-500/20 text-emerald-300/70 text-xs">
                      في انتظار الوقت
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Section: السنن الرواتب والنوافل المستحبة 🌿 */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-black text-base text-white flex items-center gap-1.5">
              <span>السنن الرواتب والنوافل المستحبة</span>
              <span>🌿</span>
            </h3>
            <p className="text-[11px] text-emerald-300/60 mt-0.5">
              أعمال تطوعية مستحبة تنال بها محبة الله دون إثبات تفريط
            </p>
          </div>

          <div
            className="w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[10px] font-bold text-center leading-tight shadow-md"
            style={{
              backgroundColor: 'var(--accent-bg-subtle)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-color)',
            }}
          >
            <span>تطوع</span>
            <span>ومحبة 🕊️</span>
          </div>
        </div>

        {/* Sunan List with Radio Dots */}
        <div className="space-y-2 pt-1">
          {VOLUNTARY_SUNNAH_CATALOG.map((sunnah) => {
            const isDone = dailyRecord.voluntarySunnahDone[sunnah.id] || false;

            return (
              <div
                key={sunnah.id}
                onClick={() => toggleSunnah(sunnah.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                  isDone
                    ? 'bg-[#103328] shadow-md'
                    : 'bg-black/30 border-emerald-500/20 hover:border-emerald-500/40'
                }`}
                style={isDone ? { borderColor: 'var(--accent-border)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-sm'
                        : 'border-emerald-400/40 bg-transparent'
                    }`}
                  >
                    {isDone && <div className="w-2 h-2 rounded-full bg-black font-black" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-white">{sunnah.titleAr}</h4>
                    <p className="text-[10px] text-emerald-300/60 line-clamp-1 mt-0.5">
                      {sunnah.virtueAr}
                    </p>
                  </div>
                </div>

                <span className="text-xl shrink-0 mr-2">{sunnah.iconEmoji}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Section: نفحة إيمانية لصلاة [المغرب] (High-contrast luxury manuscript card) */}
      {spiritualDetail && (
        <div className="rounded-3xl bg-[#fefdfb] border border-amber-200/80 p-5 text-stone-900 space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <h3 className="font-serif font-black text-base text-stone-800 flex items-center gap-1.5">
              <span>نفحة إيمانية لصلاة {PRAYER_DEFINITIONS[nextPrayerType]?.arabicName || 'المغرب'}</span>
              <span>📖</span>
            </h3>
          </div>

          {/* Quran verse shaded container */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center font-serif text-stone-900 text-sm leading-loose shadow-sm">
            {spiritualDetail.quranVerse}
            <span className="block text-[11px] text-stone-500 mt-1 font-sans">
              [{spiritualDetail.quranSurah}]
            </span>
          </div>

          {/* Hadith */}
          <p className="text-xs text-stone-700 leading-relaxed font-serif">
            {spiritualDetail.hadith}
          </p>

          {/* Tip */}
          <div className="p-3 rounded-2xl bg-amber-100/50 border border-amber-200/60 flex items-start gap-2 shadow-inner">
            <span className="text-base">💡</span>
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {spiritualDetail.spiritualTip}
            </p>
          </div>
        </div>
      )}

      {/* Qibla Compass Modal */}
      {showQibla && (
        <QiblaCompassDialog
          cityName={preferences.selectedCity.cityNameAr}
          countryName={preferences.selectedCity.countryNameAr}
          latitude={preferences.selectedCity.latitude}
          longitude={preferences.selectedCity.longitude}
          onClose={() => setShowQibla(false)}
        />
      )}
    </div>
  );
};
