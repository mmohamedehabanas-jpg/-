import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Edit2,
  Check,
  X,
  FileText
} from 'lucide-react';
import {
  DailyPrayerRecord,
  PrayerLogStatusType,
  PrayerName,
  PRAYER_DEFINITIONS
} from '../types';
import {
  calculateDailyRating,
  calculateSummaryStats,
  loadAllTrackerRecords
} from '../services/storageService';
import {
  ISLAMIC_EXCUSES,
  VOLUNTARY_SUNNAH_CATALOG
} from '../data/islamicData';

interface TrackerScreenProps {
  currentRecord: DailyPrayerRecord;
  onUpdateRecord: (record: DailyPrayerRecord) => void;
  selectedDateStr: string;
  onChangeDate: (dateStr: string) => void;
}

export const TrackerScreen: React.FC<TrackerScreenProps> = ({
  currentRecord,
  onUpdateRecord,
  selectedDateStr,
  onChangeDate,
}) => {
  const [showExcuseModal, setShowExcuseModal] = useState<boolean>(false);
  const [prayerForExcuse, setPrayerForExcuse] = useState<PrayerName | null>(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false);
  const [isFardExpanded, setIsFardExpanded] = useState<boolean>(false);
  const [isSunnahExpanded, setIsSunnahExpanded] = useState<boolean>(false);
  const [isQuranExpanded, setIsQuranExpanded] = useState<boolean>(false);
  const [isAzkarExpanded, setIsAzkarExpanded] = useState<boolean>(false);
  const [isEditingReflection, setIsEditingReflection] = useState<boolean>(false);
  const [reflectionText, setReflectionText] = useState<string>(currentRecord.dailyReflection || '');

  const rating = calculateDailyRating(currentRecord);
  const allRecords = loadAllTrackerRecords();
  const stats = calculateSummaryStats(allRecords);

  const shiftDate = (deltaDays: number) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + deltaDays);
    const yr = d.getFullYear();
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const dy = d.getDate().toString().padStart(2, '0');
    onChangeDate(`${yr}-${mo}-${dy}`);
  };

  const isToday = () => {
    const today = new Date();
    const yr = today.getFullYear();
    const mo = (today.getMonth() + 1).toString().padStart(2, '0');
    const dy = today.getDate().toString().padStart(2, '0');
    return selectedDateStr === `${yr}-${mo}-${dy}`;
  };

  const dateObj = new Date(selectedDateStr);
  const dateFormattedArabic = dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleStatusChange = (pName: PrayerName, status: PrayerLogStatusType) => {
    if (status === 'excused') {
      setPrayerForExcuse(pName);
      setShowExcuseModal(true);
      return;
    }

    const updatedStatuses = { ...currentRecord.prayerStatuses, [pName]: status };
    const updatedExcuses = { ...currentRecord.prayerExcuses };
    delete updatedExcuses[pName];

    onUpdateRecord({
      ...currentRecord,
      prayerStatuses: updatedStatuses,
      prayerExcuses: updatedExcuses,
    });
  };

  const handleSelectExcuse = (excuseId: string) => {
    if (!prayerForExcuse) return;

    onUpdateRecord({
      ...currentRecord,
      prayerStatuses: {
        ...currentRecord.prayerStatuses,
        [prayerForExcuse]: 'excused',
      },
      prayerExcuses: {
        ...currentRecord.prayerExcuses,
        [prayerForExcuse]: excuseId,
      },
    });

    setShowExcuseModal(false);
    setPrayerForExcuse(null);
  };

  const toggleSunnah = (sunnahId: string) => {
    const cur = currentRecord.voluntarySunnahDone[sunnahId] || false;
    onUpdateRecord({
      ...currentRecord,
      voluntarySunnahDone: {
        ...currentRecord.voluntarySunnahDone,
        [sunnahId]: !cur,
      },
    });
  };

  const toggleAzkarCheck = (key: 'morningAzkarDone' | 'eveningAzkarDone' | 'sleepAzkarDone' | 'afterPrayerAzkarDone') => {
    onUpdateRecord({
      ...currentRecord,
      [key]: !currentRecord[key],
    });
  };

  const adjustQuranPages = (delta: number) => {
    const currentPages = currentRecord.quranWirdPagesRead || 0;
    const newPages = Math.max(0, currentPages + delta);
    onUpdateRecord({
      ...currentRecord,
      quranWirdPagesRead: newPages,
      quranWirdCompleted: newPages >= currentRecord.quranWirdTargetPages,
    });
  };

  const saveReflection = () => {
    onUpdateRecord({
      ...currentRecord,
      dailyReflection: reflectionText,
    });
    setIsEditingReflection(false);
  };

  const fardPrayers: PrayerName[] = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];

  const fardCompletedCount = fardPrayers.filter(
    (p) => currentRecord.prayerStatuses[p] === 'on_time' || currentRecord.prayerStatuses[p] === 'excused'
  ).length;

  const sunnahCompletedCount = Object.values(currentRecord.voluntarySunnahDone || {}).filter(Boolean).length;
  const azkarCompletedCount = [
    currentRecord.morningAzkarDone,
    currentRecord.eveningAzkarDone,
    currentRecord.sleepAzkarDone,
    currentRecord.afterPrayerAzkarDone,
  ].filter(Boolean).length;

  // Counts for the 4 metrics cards
  const onTimeToday = fardPrayers.filter((p) => currentRecord.prayerStatuses[p] === 'on_time').length;
  const lateToday = fardPrayers.filter((p) => currentRecord.prayerStatuses[p] === 'late').length;
  const excusedToday = fardPrayers.filter((p) => currentRecord.prayerStatuses[p] === 'excused').length;
  const missedToday = fardPrayers.filter((p) => currentRecord.prayerStatuses[p] === 'missed').length;

  const onTimePercentage = fardCompletedCount > 0 ? Math.round((fardCompletedCount / 5) * 100) : 0;

  const getPrayerIconEmoji = (type: PrayerName) => {
    switch (type) {
      case 'FAJR':
        return '🌅';
      case 'DHUHR':
        return '☀️';
      case 'ASR':
        return '🌤️';
      case 'MAGHRIB':
        return '🌇';
      case 'ISHA':
        return '🌙';
      default:
        return '🕌';
    }
  };

  return (
    <div className="space-y-4 pb-28 text-white select-none" dir="rtl">
      {/* 1. Header with Circular Gauge */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1 className="font-serif font-black text-xl text-white">
            المتابعة وسجل الأعذار
          </h1>
          <p className="text-[11px] text-emerald-300/80 mt-0.5">
            سجل التزام الصلوات المفروضة، الأذكار، ورخص الأعذار الشرعية
          </p>
        </div>

        {/* Circular Percentage Pill */}
        <div className="w-12 h-12 rounded-full bg-[#122822] border border-emerald-500/30 flex flex-col items-center justify-center text-center p-1 shadow-sm">
          <span className="text-[9px] text-emerald-300 leading-tight">في وقتها</span>
          <span className="text-xs font-black text-amber-300 font-mono">{onTimePercentage}%</span>
          <span className="text-[8px] text-emerald-400/60 leading-tight">{fardCompletedCount} من 5</span>
        </div>
      </div>

      {/* 2. Date Navigator Bar */}
      <div className="p-3 rounded-2xl bg-[#091f18]/90 border border-emerald-500/20 text-center space-y-1 shadow-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white font-serif">
              {dateFormattedArabic}
            </span>
            {isToday() && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-400/50 text-[10px] text-emerald-100 font-bold">
                اليوم 📍
              </span>
            )}
          </div>

          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {!isToday() && (
          <button
            onClick={() => {
              const today = new Date();
              const yr = today.getFullYear();
              const mo = (today.getMonth() + 1).toString().padStart(2, '0');
              const dy = today.getDate().toString().padStart(2, '0');
              onChangeDate(`${yr}-${mo}-${dy}`);
            }}
            className="text-[11px] text-amber-400/90 hover:underline block mx-auto"
          >
            انقر للعودة دائماً لليوم الحالي
          </button>
        )}
      </div>

      {/* 3. Collapsible Mini Calendar Trigger */}
      <button
        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
        className="w-full py-2.5 px-4 rounded-2xl bg-[#091f18]/70 hover:bg-[#0c271f] border border-emerald-500/20 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
      >
        <span>عرض التقويم المصغر لتسجيل الأيام السابقة 📅</span>
        {isCalendarExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
      </button>

      {/* Mini Calendar Drawer */}
      {isCalendarExpanded && (
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 grid grid-cols-7 gap-1.5 text-center text-xs animate-fade-in">
          {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((dayName, idx) => (
            <span key={idx} className="font-bold text-amber-400/80 text-[11px] py-1">
              {dayName}
            </span>
          ))}
          {Array.from({ length: 14 }).map((_, i) => {
            const target = new Date();
            target.setDate(target.getDate() - 13 + i);
            const yr = target.getFullYear();
            const mo = (target.getMonth() + 1).toString().padStart(2, '0');
            const dy = target.getDate().toString().padStart(2, '0');
            const str = `${yr}-${mo}-${dy}`;
            const isSel = str === selectedDateStr;

            return (
              <button
                key={str}
                onClick={() => onChangeDate(str)}
                className={`py-1.5 rounded-xl font-mono text-xs transition-colors ${
                  isSel
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-emerald-200'
                }`}
              >
                {target.getDate()}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Four Metric Cards Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-[#091f18]/90 border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-emerald-400">✅</div>
          <div className="text-xl font-black text-emerald-300 font-mono">{onTimeToday}</div>
          <span className="text-[10px] text-emerald-400/80 block">في وقتها</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#091f18]/90 border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-amber-400">⏳</div>
          <div className="text-xl font-black text-amber-300 font-mono">{lateToday}</div>
          <span className="text-[10px] text-amber-300/80 block">متأخرة</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#091f18]/90 border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-blue-400">📝</div>
          <div className="text-xl font-black text-blue-300 font-mono">{excusedToday}</div>
          <span className="text-[10px] text-blue-300/80 block">أعذار شرعية</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#091f18]/90 border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-red-400">❌</div>
          <div className="text-xl font-black text-red-300 font-mono">{missedToday}</div>
          <span className="text-[10px] text-red-400/80 block">فائتة</span>
        </div>
      </div>

      {/* 5. Card: التقييم اليومي وميزان الطاعات ⭐ */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif font-black text-base text-white flex items-center gap-1.5">
              <span>التقييم اليومي وميزان الطاعات</span>
              <span className="text-amber-400">⭐</span>
            </h3>
            <p className="text-[10px] text-emerald-300/70">
              5 نجوم للفروض + النجمة السادسة الاستثنائية للتطوع
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-black/40 border border-emerald-500/30 text-center">
            <span className="text-xs font-mono font-black text-amber-400">{rating.totalPoints} نقطة</span>
            <span className="text-[9px] text-emerald-400/70 block">طاعة 🌌</span>
          </div>
        </div>

        {/* Stars Row with 6th Star Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((sIndex) => {
              const isFilled = sIndex <= rating.starCount;
              return (
                <Star
                  key={sIndex}
                  className={`w-6 h-6 transition-all ${
                    isFilled ? 'text-amber-400 fill-amber-400' : 'text-emerald-900/60'
                  }`}
                />
              );
            })}
          </div>

          <span className="text-xs text-emerald-300/80 font-mono">
            ({fardCompletedCount}/5 فروض)
          </span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 border border-emerald-500/30 text-xs text-emerald-200">
            <span>النجمة 6 (نوافل)</span>
            <span className="text-sm">{rating.isSixthStarUnlocked ? '🌟' : '⚪'}</span>
          </div>
        </div>

        {/* Guidance Box inside */}
        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-1">
          <h4 className="font-bold text-xs text-amber-300 font-serif">{rating.feedbackTitle}</h4>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">{rating.feedbackDescription}</p>
        </div>
      </div>

      {/* 6. Section: متابعة الصلوات المفروضة */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3.5 shadow-xl">
        <div
          onClick={() => setIsFardExpanded(!isFardExpanded)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isFardExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            <h3 className="font-serif font-black text-base text-white">متابعة الصلوات المفروضة</h3>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold font-mono">
            {fardCompletedCount} من 5 مكتملة
          </span>
        </div>

        {/* Fard Prayers List */}
        {isFardExpanded && (
          <div className="space-y-3 pt-1">
            {fardPrayers.map((pName) => {
              const pInfo = PRAYER_DEFINITIONS[pName];
              const status: PrayerLogStatusType = currentRecord.prayerStatuses[pName] || 'pending';

              const getStatusText = (st: PrayerLogStatusType) => {
                switch (st) {
                  case 'on_time':
                    return 'أُديت في وقتها';
                  case 'late':
                    return 'أُديت قضاءً / متأخرة';
                  case 'excused':
                    return 'عذر شرعي مقبول';
                  case 'missed':
                    return 'فائتة / لم تُصلَّ';
                  default:
                    return 'في انتظار الصلاة';
                }
              };

              return (
                <div
                  key={pName}
                  className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPrayerIconEmoji(pName)}</span>
                      <h4 className="font-bold text-sm text-white">أذان {pInfo.arabicName}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
                      <span>{status === 'pending' ? 'في انتظار الصلاة' : getStatusText(status)}</span>
                      {status !== 'pending' && <span className="text-amber-400 font-bold">✓</span>}
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-400/60 font-mono">
                    الحالة الحالية: {getStatusText(status)}
                  </div>

                  {/* 4 Action Buttons in a row */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => handleStatusChange(pName, 'on_time')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        status === 'on_time'
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                          : 'bg-black/40 border-emerald-500/20 text-emerald-200 hover:bg-emerald-950/40'
                      }`}
                    >
                      في وقتها ✅
                    </button>

                    <button
                      onClick={() => handleStatusChange(pName, 'late')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        status === 'late'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                          : 'bg-black/40 border-emerald-500/20 text-amber-300 hover:bg-amber-950/40'
                      }`}
                    >
                      متأخرة ⏳
                    </button>

                    <button
                      onClick={() => handleStatusChange(pName, 'excused')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        status === 'excused'
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                          : 'bg-black/40 border-emerald-500/20 text-blue-300 hover:bg-blue-950/40'
                      }`}
                    >
                      عذر شرعي 📝
                    </button>

                    <button
                      onClick={() => handleStatusChange(pName, 'missed')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        status === 'missed'
                          ? 'bg-red-700 border-red-500 text-white shadow-md'
                          : 'bg-black/40 border-emerald-500/20 text-red-300 hover:bg-red-950/40'
                      }`}
                    >
                      فائتة ❌
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Collapsible: السنن الرواتب والنوافل */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
        <div
          onClick={() => setIsSunnahExpanded(!isSunnahExpanded)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isSunnahExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            <div>
              <h4 className="font-bold text-sm text-white">السنن الرواتب والنوافل</h4>
              <p className="text-[10px] text-emerald-400/60 mt-0.5">أعمال تطوعية مستحبة تنال بها محبة الله دون إثبات تفريط</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/40 border border-emerald-500/30 text-emerald-200 text-xs font-mono">
            {sunnahCompletedCount} منجزة (تطوع) 🌌
          </span>
        </div>

        {isSunnahExpanded && (
          <div className="space-y-2 pt-2 animate-fade-in">
            {VOLUNTARY_SUNNAH_CATALOG.map((sunnah) => {
              const isDone = currentRecord.voluntarySunnahDone[sunnah.id] || false;
              return (
                <div
                  key={sunnah.id}
                  onClick={() => toggleSunnah(sunnah.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isDone ? 'bg-[#103328] border-amber-400/70' : 'bg-black/30 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isDone ? 'border-amber-400 bg-amber-400' : 'border-emerald-400/40'
                      }`}
                    >
                      {isDone && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">{sunnah.titleAr}</h5>
                      <span className="text-[10px] text-amber-300">{sunnah.rakatsText}</span>
                    </div>
                  </div>
                  <span className="text-xl">{sunnah.iconEmoji}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Collapsible: ورد القرآن الكريم اليومي */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
        <div
          onClick={() => setIsQuranExpanded(!isQuranExpanded)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isQuranExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            <div>
              <h4 className="font-bold text-sm text-white">ورد القرآن الكريم اليومي</h4>
              <p className="text-[10px] text-emerald-400/60 mt-0.5">«اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ»</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/40 border border-emerald-500/30 text-amber-300 text-xs font-mono">
            {currentRecord.quranWirdPagesRead || 0} من 20 صفحة
          </span>
        </div>

        {isQuranExpanded && (
          <div className="pt-2 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300">الصفحات المقروءة:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustQuranPages(-1)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-emerald-500/20 text-xs"
                >
                  -1
                </button>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {currentRecord.quranWirdPagesRead || 0}
                </span>
                <button
                  onClick={() => adjustQuranPages(1)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  +1
                </button>
                <button
                  onClick={() => adjustQuranPages(5)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9. Collapsible: متابعة الأذكار اليومية */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
        <div
          onClick={() => setIsAzkarExpanded(!isAzkarExpanded)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {isAzkarExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            <div>
              <h4 className="font-bold text-sm text-white">متابعة الأذكار اليومية</h4>
              <p className="text-[10px] text-emerald-400/60 mt-0.5">أذكار الصباح والمساء والنوم وعقب الصلوات</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/40 border border-emerald-500/30 text-emerald-200 text-xs font-mono">
            {azkarCompletedCount} من 4 منجزة 📿
          </span>
        </div>

        {isAzkarExpanded && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-fade-in">
            {[
              { key: 'morningAzkarDone' as const, title: 'أذكار الصباح', icon: '🌅' },
              { key: 'eveningAzkarDone' as const, title: 'أذكار المساء', icon: '🌇' },
              { key: 'sleepAzkarDone' as const, title: 'أذكار النوم', icon: '🌙' },
              { key: 'afterPrayerAzkarDone' as const, title: 'أذكار بعد الصلاة', icon: '🕌' },
            ].map((azkar) => {
              const isDone = currentRecord[azkar.key];
              return (
                <button
                  key={azkar.key}
                  onClick={() => toggleAzkarCheck(azkar.key)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                    isDone ? 'bg-emerald-950/60 border-amber-400 text-white' : 'bg-black/30 border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <span className="text-xs font-bold">{azkar.icon} {azkar.title}</span>
                  <span>{isDone ? '✅' : '⚪'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 10. Section: فقه الرخص والأعذار الشرعية في الإسلام 📜 (Pure White High-Contrast Card) */}
      <div className="rounded-3xl bg-[#fefdfb] border border-amber-200/80 p-5 text-stone-900 space-y-3.5 shadow-2xl">
        <h3 className="font-serif font-black text-base text-stone-800 flex items-center gap-1.5 border-b border-amber-100 pb-2">
          <span>فقه الرخص والأعذار الشرعية في الإسلام</span>
          <span>📜</span>
        </h3>

        {/* Hadith Quote in Shaded Container */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center font-serif text-stone-900 text-xs leading-loose">
          «إِنَّ اللَّهَ يُحِبُّ أَنْ تُؤْتَى رُخَصُهُ، كَمَا يَكْرَهُ أَنْ تُؤْتَى مَعْصِيَتُهُ» [رواه أحمد وصححه الألباني]
        </div>

        <p className="text-xs text-stone-700 leading-relaxed font-sans text-justify">
          ديننا دين يسر ورحمة؛ فالسفر والمرض والنسيان غير المتعمد والظروف القاهرة كلها رخص معتبرة شرعاً ترفع الحرج عن العبد وتوجب عليه الصلاة بحسب استطاعته أو قضاءها فور زوال العذر.
        </p>
      </div>

      {/* 11. Section: خواطر وملاحظات اليوم ✍️ */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-serif">
            <span>خواطر وملاحظات اليوم</span>
            <span>✍️</span>
          </h4>

          <button
            onClick={() => setIsEditingReflection(!isEditingReflection)}
            className="p-1 text-amber-400 hover:text-amber-300"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {isEditingReflection ? (
          <div className="space-y-2">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              rows={3}
              placeholder="اكتب ملاحظاتك، دعاءك، أو خواطرك لهذا اليوم..."
              className="w-full p-3 rounded-2xl bg-black/40 border border-emerald-500/30 text-white text-xs placeholder:text-emerald-400/40 focus:outline-none focus:border-amber-400 font-serif"
            />
            <button
              onClick={saveReflection}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              حفظ
            </button>
          </div>
        ) : (
          <p className="text-xs text-emerald-300/70 leading-relaxed">
            {currentRecord.dailyReflection || 'لا توجد ملاحظات مسجلة لهذا اليوم. انقر على أيقونة القلم للكتابة.'}
          </p>
        )}
      </div>

      {/* Excuse Picker Modal */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-blue-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-blue-200 font-serif">
                الأعذار والرخص الشرعية المعتبرة
              </h3>
              <button
                onClick={() => setShowExcuseModal(false)}
                className="p-1 rounded-full bg-white/5 text-emerald-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {ISLAMIC_EXCUSES.map((excuse) => (
                <button
                  key={excuse.id}
                  onClick={() => handleSelectExcuse(excuse.id)}
                  className="w-full text-right p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-blue-500/20 hover:border-blue-400 transition-all block"
                >
                  <div className="flex items-center gap-2">
                    <span>{excuse.iconEmoji}</span>
                    <span className="font-bold text-xs text-white">{excuse.titleAr}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/70 mt-1">{excuse.descriptionAr}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
