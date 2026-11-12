import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HeartHandshake,
  Sparkles,
  BookOpen,
  BellOff,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  LockdownStepType,
  MissedReason,
  PrayerName,
  PRAYER_DEFINITIONS
} from '../types';
import { MISSED_REASONS } from '../data/islamicData';

interface LockScreenModalProps {
  prayerType: PrayerName;
  currentStep: LockdownStepType;
  selectedReason: MissedReason | null;
  onYesPrayed: () => void;
  onNoNotPrayed: () => void;
  onSelectReason: (reason: MissedReason) => void;
  onConfirmPrayedNow: () => void;
  onDismiss: () => void;
  onEmergencySnooze: () => void;
  onOpenAfterPrayerAzkar: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  prayerType,
  currentStep,
  selectedReason,
  onYesPrayed,
  onNoNotPrayed,
  onSelectReason,
  onConfirmPrayedNow,
  onDismiss,
  onEmergencySnooze,
  onOpenAfterPrayerAzkar,
}) => {
  const prayerInfo = PRAYER_DEFINITIONS[prayerType] || PRAYER_DEFINITIONS.DHUHR;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c59b27', '#10b981', '#34d399', '#fef08a']
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#09221b] via-[#061712] to-[#030a08] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top App Crown */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif font-black text-lg shadow-lg shadow-amber-500/10">
              🕋
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider block font-serif">حِصْنُ المُسْلِم • حَقُّ اللَّهِ</span>
              <h2 className="text-lg font-bold text-emerald-100">نداء صلاة {prayerInfo.arabicName}</h2>
            </div>
          </div>
          <button
            onClick={onEmergencySnooze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 text-xs transition-colors border border-white/10"
            title="تأجيل اضطراري لمدة 10 دقائق"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>تأجيل (10د)</span>
          </button>
        </div>

        {/* STEP 1: هل صليت الفريضة؟ */}
        {currentStep === 'QUESTION_PRAYED' && (
          <div className="py-6 text-center space-y-6">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-amber-400 animate-pulse">
              <Sparkles className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white font-serif">
                هل صليت صلاة {prayerInfo.arabicName}؟
              </h3>
              <p className="text-sm text-emerald-200/80 max-w-sm mx-auto leading-relaxed">
                الصلاة عماد الدين وأحب الأعمال إلى الله في وقتها. كن صادقاً مع نفسك ومع ربك الكريم.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  triggerConfetti();
                  onYesPrayed();
                }}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span>نعم، صليت بحمد الله</span>
              </button>

              <button
                onClick={onNoNotPrayed}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600/80 hover:to-amber-800/80 text-white font-bold text-base flex items-center justify-center gap-2 border border-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5 text-amber-300" />
                <span>لا، لم أصلِّ بعد</span>
              </button>
            </div>

            <div className="pt-2">
              <span className="text-xs text-emerald-400/60 font-mono">
                ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: ما الذي منعك أو شغلك؟ */}
        {currentStep === 'QUESTION_REASON' && (
          <div className="py-4 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-amber-300 font-serif">
                ما الذي شغلك عن صلاة {prayerInfo.arabicName}؟
              </h3>
              <p className="text-xs text-emerald-200/70">
                اختر السبب بصدق لنقدم لك التوجيه النبوي والروحي المعين
              </p>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {MISSED_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => onSelectReason(reason)}
                  className="w-full text-right p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-amber-400/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-black/40 border border-emerald-500/20">
                      {reason.iconEmoji}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-100 group-hover:text-amber-300 transition-colors">
                        {reason.title}
                      </h4>
                      <p className="text-[11px] text-emerald-300/60 line-clamp-1">
                        {reason.guidanceTitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400/40 group-hover:text-amber-400 rotate-180 transition-transform group-hover:-translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: التوجيه الروحي والمبادرة للصلاة الآن */}
        {currentStep === 'GUIDANCE_ADVICE' && selectedReason && (
          <div className="py-4 space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-3xl">{selectedReason.iconEmoji}</span>
              <div>
                <span className="text-xs text-amber-300/80 font-bold block">{selectedReason.title}</span>
                <h4 className="text-base font-black text-amber-200">{selectedReason.guidanceTitle}</h4>
              </div>
            </div>

            {/* Scripture quote */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center font-serif text-amber-200 text-sm leading-relaxed shadow-inner">
              {selectedReason.scripture}
            </div>

            {/* Guidance details */}
            <p className="text-xs text-emerald-100/90 leading-relaxed text-justify px-1">
              {selectedReason.guidanceText}
            </p>

            {/* Action hint */}
            <div className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-400/30 flex items-start gap-2.5">
              <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-100 font-medium">
                {selectedReason.actionHint}
              </p>
            </div>

            {/* Confirm prayed now button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  triggerConfetti();
                  onConfirmPrayedNow();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/50 border border-emerald-400/50 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span>قمت وتوضأت وصليت الآن بحمد الله</span>
              </button>

              <button
                onClick={onEmergencySnooze}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300/80 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <BellOff className="w-3.5 h-3.5 text-amber-400/80" />
                <span>تأجيل اضطراري لمدة 10 دقائق فقط</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: دعاء وثناء فك الحظر والإنجاز */}
        {currentStep === 'COMPLETED_BLESSING' && (
          <div className="py-6 text-center space-y-6">
            <div className="inline-flex p-5 rounded-full bg-emerald-500/20 border-2 border-amber-400 text-amber-300 shadow-xl shadow-amber-500/20 animate-bounce">
              <HeartHandshake className="w-12 h-12 text-amber-300" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-amber-300 font-serif">
                تقبل الله طاعتكم وصالح أعمالكم
              </h3>
              <p className="text-sm text-emerald-100/90 max-w-sm mx-auto leading-relaxed">
                جعلك الله من مقيمي الصلاة ومحبيها، ونوّر قلبك ويومك ببركتها. الصلاة نور وراحة وطمأنينة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 font-serif text-sm text-amber-200">
              «اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ»
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={onOpenAfterPrayerAzkar}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>أذكار بعد الصلاة</span>
              </button>

              <button
                onClick={onDismiss}
                className="py-3 px-4 rounded-2xl bg-emerald-800/50 hover:bg-emerald-700/60 border border-emerald-500/30 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>متابعة اليوم ببركة الله</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
