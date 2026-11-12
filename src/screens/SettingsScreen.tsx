import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Check,
  Search,
  MapPin,
  MessageCircle,
  Phone,
  FileAudio,
  Upload,
  RefreshCw,
  Bell,
  Download,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { CityLocation, PrayerName, UserPreferences } from '../types';
import { CALCULATION_METHODS, PREDEFINED_CITIES } from '../data/islamicData';
import { audioService } from '../services/audioService';
import { HomeWidgetCard } from '../components/HomeWidgetCard';
import { getInstalledAppInfo, shareAppDownloadLink } from '../services/updateService';
import { UpdateCheckResult } from '../types/update';

interface SettingsScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onDetectGps: () => void;
  isGpsLoading: boolean;
  onOpenReleasesModal?: () => void;
  onCheckForUpdates?: () => Promise<UpdateCheckResult | null>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onDetectGps,
  isGpsLoading,
  onOpenReleasesModal,
  onCheckForUpdates,
}) => {
  const installedInfo = getInstalledAppInfo();
  const [updateCheckStatus, setUpdateCheckStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  // Manage which accordion sections are open - ALL closed by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    default_adhan: false,
    custom_adhan: false,
    background_work: false,
    permissions: false,
    theme: false,
    widget: false,
    location: false,
  });

  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(audioService.isPlaying());
  const [previewPrayer, setPreviewPrayer] = useState<PrayerName | null>(null);
  const [citySearch, setCitySearch] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prayerFileInputRef = useRef<HTMLInputElement>(null);
  const [targetPrayerForFile, setTargetPrayerForFile] = useState<PrayerName | null>(null);

  React.useEffect(() => {
    return audioService.subscribe(setIsPlayingAdhan);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCitySelect = (city: CityLocation) => {
    onUpdatePreferences({
      ...preferences,
      selectedCity: city,
      calculationMethod: city.defaultMethod || preferences.calculationMethod,
    });
  };

  const handleVolumeChange = (vol: number) => {
    audioService.setVolume(vol);
    onUpdatePreferences({
      ...preferences,
      adhanVolume: vol,
    });
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdatePreferences({
        ...preferences,
        customAdhanFileName: file.name,
      });
      alert(`تم بنجاح تعيين ملف: ${file.name} كصوت أذان عام.`);
    }
  };

  const handlePrayerCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetPrayerForFile) {
      onUpdatePreferences({
        ...preferences,
        prayerCustomAdhans: {
          ...preferences.prayerCustomAdhans,
          [targetPrayerForFile]: file.name,
        },
      });
      alert(`تم تخصيص ملف: ${file.name} لصلاة ${targetPrayerForFile}`);
      setTargetPrayerForFile(null);
    }
  };

  const togglePermission = (key: string) => {
    const cur = preferences.permissionsStatus?.[key] ?? true;
    onUpdatePreferences({
      ...preferences,
      permissionsStatus: {
        ...(preferences.permissionsStatus || {}),
        [key]: !cur,
      },
    });
  };

  const filteredCities = PREDEFINED_CITIES.filter(
    (c) =>
      c.cityNameAr.includes(citySearch) ||
      c.cityNameEn.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.countryNameAr.includes(citySearch)
  );

  const prayersList: { name: PrayerName; arabicName: string; icon: string }[] = [
    { name: 'FAJR', arabicName: 'أذان الفجر', icon: '🌅' },
    { name: 'DHUHR', arabicName: 'أذان الظهر', icon: '☀️' },
    { name: 'ASR', arabicName: 'أذان العصر', icon: '🌤️' },
    { name: 'MAGHRIB', arabicName: 'أذان المغرب', icon: '🌇' },
    { name: 'ISHA', arabicName: 'أذان العشاء', icon: '🌙' },
  ];

  const permissionsList = [
    {
      id: 'gps',
      num: '1',
      title: '1. الموقع الجغرافي (GPS Location)',
      desc: 'لحساب مواقيت الصلاة بدقة فلكية حسب إحداثيات موقعك',
    },
    {
      id: 'exact_alarms',
      num: '2',
      title: '2. المنبهات الدقيقة (Exact Alarms)',
      desc: 'لإطلاق صوت الأذان وشاشة الحظر في الثانية المحددة بالضبط دون تأخير',
    },
    {
      id: 'battery_bypass',
      num: '3',
      title: '3. استثناء موفر الطاقة والسكون (Battery Bypass)',
      desc: 'لمنع النظام من إيقاف خدمات الأذان عند إغلاق الشاشة أو في وضع السكون العميق',
    },
    {
      id: 'notifications',
      num: '4',
      title: '4. إرسال الإشعارات والتنبيهات (Notifications)',
      desc: 'لعرض تنبيهات الأذان والعد التنازلي الثابت في شريط الإشعارات وشاشة القفل',
    },
    {
      id: 'overlay',
      num: '5',
      title: '5. الظهور فوق التطبيقات وشاشة القفل (Overlay)',
      desc: 'لفتح التطبيق وشاشة الحظر فوراً حتى لو كان الهاتف مقفلاً أو قيد استخدام تطبيق آخر',
    },
    {
      id: 'storage',
      num: '6',
      title: 'الوصول لذاكرة الهاتف (Storage Permission)',
      desc: 'لقراءة واختيار مقاطع وملفات الأذان الصوتية المخصصة من ذاكرة الجهاز',
    },
  ];

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  return (
    <div className="space-y-4 pb-28 text-white select-none" dir="rtl">
      {/* 1. Top Header */}
      <div className="text-right pt-1 pb-1">
        <h1 className="font-serif font-black text-xl text-white">
          الإعدادات المتقدمة
        </h1>
        <p className="text-[11px] text-emerald-300/80 mt-0.5">
          إدارة صوت الأذان العام والمخصص، الويجت، لوحة الأذونات، وخلفية النظام
        </p>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*"
        onChange={handleCustomFileUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={prayerFileInputRef}
        accept="audio/*"
        onChange={handlePrayerCustomFileUpload}
        className="hidden"
      />

      {/* 1.5 Official Releases, Update Check & APK Distribution Hub Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-[#0a231b] to-teal-950/90 border border-emerald-400/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-serif font-bold text-sm text-white">
            التوزيع والتحديثات المستمرة
          </div>
          <span className="text-xs text-amber-300 font-mono tabular-nums">
            v{installedInfo.versionName} · Code {installedInfo.versionCode}
          </span>
        </div>

        <p className="text-xs text-emerald-200/80 leading-relaxed text-right">
          تحقق من توفر إصدارات أندرويد جديدة، حمّل حزمة APK مع فحص SHA-256، أو شارك صفحة تنزيل التطبيق مع الآخرين.
        </p>

        {updateCheckStatus && (
          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/25 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{updateCheckStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={onOpenReleasesModal}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>صفحة التنزيل والـ APK</span>
          </button>

          <button
            onClick={async () => {
              if (!onCheckForUpdates) return;
              setIsCheckingUpdate(true);
              setUpdateCheckStatus(null);
              const res = await onCheckForUpdates();
              setIsCheckingUpdate(false);
              if (res && !res.updateAvailable) {
                setUpdateCheckStatus(`أنت تستخدم أحدث إصدار منشور (v${res.latestVersion})`);
              } else if (!res) {
                setUpdateCheckStatus('تعذر الاتصال بخادم التحديثات حالياً.');
              }
            }}
            disabled={isCheckingUpdate}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>فحص التحديثات</span>
          </button>

          <button
            onClick={async () => {
              const status = await shareAppDownloadLink(installedInfo.versionName);
              if (status === 'copied') {
                setUpdateCheckStatus('تم نسخ رابط صفحة التنزيل للمشاركة');
              }
            }}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>مشاركة رابط التنزيل</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* CARD 1: صوت الأذان الافتراضي العام 🎙️ */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('default_adhan')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.default_adhan ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold font-mono">
                ملف هاتف 📁
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">صوت الأذان الافتراضي العام</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  إدارة ملف الصوت الموحد، مستوى الصوت، وتثويب الفجر
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                🎙️
              </div>
            </div>
          </div>

          {openSections.default_adhan && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-3.5 animate-fade-in">
              {/* White Audio Card (as in screenshot) */}
              <div className="p-4 rounded-2xl bg-[#fefdfb] border border-amber-200 text-stone-900 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-bold">الصوت العام المعتمد:</span>
                  <span className="text-emerald-700">🎵</span>
                </div>
                <div className="font-mono text-xs font-bold text-stone-800 break-all select-all">
                  {preferences.customAdhanFileName || 'Nur-alaa-_______-_________-_________50062c39.mp3'}
                </div>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  يعمل هذا الملف الصوتي كأذان موحد لجميع الصلوات، ما لم تقم بتخصيص صلاة معينة أدناه.
                </p>
              </div>

              {/* Choose MP3/WAV Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-[#144d42] hover:bg-[#1a5f52] text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-400/40 shadow-md transition-all active:scale-[0.99]"
              >
                <span>اختيار وتعيين صوت الأذان العام (/ MP3 / WAV)</span>
                <span className="text-base">📄</span>
              </button>

              {/* Dual Test & Restore Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (isPlayingAdhan) audioService.stopAdhan();
                    else audioService.playAdhan();
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isPlayingAdhan
                      ? 'bg-amber-500 text-black border border-amber-400 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlayingAdhan ? 'إيقاف الأذان' : 'تجربة الأذان العام'}</span>
                </button>

                <button
                  onClick={() => {
                    onUpdatePreferences({
                      ...preferences,
                      customAdhanFileName: 'Nur-alaa-_______-_________-_________50062c39.mp3',
                    });
                    alert('تمت استعادة ملف الأذان الافتراضي.');
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الافتراضي</span>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>مستوى صوت الأذان: {Math.round(preferences.adhanVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.adhanVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-black/40 rounded-lg"
                />
              </div>

              {/* Fajr Tatweeb Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
                <button
                  onClick={() =>
                    onUpdatePreferences({
                      ...preferences,
                      isFajrTatweebEnabled: !preferences.isFajrTatweebEnabled,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preferences.isFajrTatweebEnabled ? 'bg-amber-400' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      preferences.isFajrTatweebEnabled ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                    }`}
                  />
                </button>

                <div className="text-right">
                  <span className="font-bold text-xs text-white block">تلبية «الصلاة خيرٌ من النوم»</span>
                  <span className="text-[10px] text-emerald-400/60">
                    تضمين التثويب المأثور خصيصاً في أذان صلاة الفجر
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: تخصيص صوت مستقل لكل صلاة 🕌 */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('custom_adhan')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.custom_adhan ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-white/5 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                الكل بالافتراضي 🕌
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">تخصيص صوت مستقل لكل صلاة</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  تخصيص صوت فريد لصلاة معينة أو تركها لتتبع العام
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                🕌
              </div>
            </div>
          </div>

          {openSections.custom_adhan && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-3 animate-fade-in">
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                القاعدة: تعتمد جميع الصلوات تلقائياً «الصوت الافتراضي العام»، ما لم تخصص صلاة بعينها بصوت مستقل:
              </p>

              {/* 5 Prayers */}
              <div className="space-y-2.5">
                {prayersList.map((pr) => {
                  const isEnabled = preferences.adhanEnabledPrayers[pr.name] ?? true;
                  const isThisPlaying = isPlayingAdhan && previewPrayer === pr.name;

                  return (
                    <div
                      key={pr.name}
                      className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        {/* Toggle switch */}
                        <button
                          onClick={() => {
                            onUpdatePreferences({
                              ...preferences,
                              adhanEnabledPrayers: {
                                ...preferences.adhanEnabledPrayers,
                                [pr.name]: !isEnabled,
                              },
                            });
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            isEnabled ? 'bg-teal-500' : 'bg-white/10'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                            الصوت العام 🔗
                          </span>
                          <span className="font-bold text-xs text-white">{pr.arabicName}</span>
                          <span className="text-base">{pr.icon}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-400/60 font-mono break-all text-right">
                        الصوت الفعلي: يتبع الصوت الافتراضي العام
                        <br />
                        Nur-alaa-_______-_________-_________50062c39.mp3
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (isThisPlaying) {
                              audioService.stopAdhan();
                              setPreviewPrayer(null);
                            } else {
                              setPreviewPrayer(pr.name);
                              audioService.playAdhan();
                            }
                          }}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                            isThisPlaying
                              ? 'bg-amber-500 text-black animate-pulse'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{isThisPlaying ? 'إيقاف' : 'تجربة'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setTargetPrayerForFile(pr.name);
                            prayerFileInputRef.current?.click();
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#144d42] hover:bg-[#1a5f52] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-400/30"
                        >
                          <FileAudio className="w-3 h-3 text-amber-300" />
                          <span>تخصيص صوت</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: العمل المستمر في الخلفية ⚡ */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('background_work')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.background_work ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
                preferences.isBackgroundWorkActive
                  ? 'bg-emerald-950 border-emerald-400/40 text-emerald-200'
                  : 'bg-red-950 border-red-400/40 text-red-200'
              }`}>
                {preferences.isBackgroundWorkActive ? 'نشطة 🟢' : 'متوقفة 🔴'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">العمل المستمر في الخلفية</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  ضمان حساب الأوقات والحظر دون إيقاف النظام
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                ⚡
              </div>
            </div>
          </div>

          {openSections.background_work && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
                <button
                  onClick={() =>
                    onUpdatePreferences({
                      ...preferences,
                      isBackgroundWorkActive: !preferences.isBackgroundWorkActive,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preferences.isBackgroundWorkActive ? 'bg-teal-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      preferences.isBackgroundWorkActive ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                    }`}
                  />
                </button>

                <div className="text-right">
                  <span className="font-bold text-xs text-white block">حالة الخدمة الخلفية المستمرة</span>
                  <span className="text-[10px] text-emerald-400/60">
                    تفعيل المزامنة في الخلفية وإطلاق شاشة حق الله التلقائية
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                الخدمة الخلفية تعمل بدقة لمزامنة مواقيت الصلاة وشاشة حق الله دون انقطاع حتى مع سكون الهاتف.
              </p>
            </div>
          )}
        </div>

        {/* CARD 4: لوحة الأذونات التفاعلية (5 أذونات) 🛡️ (Matching Screenshot Exactly) */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('permissions')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.permissions ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-teal-800/80 border border-teal-400/40 text-teal-100 text-xs font-bold font-mono">
                {permissionsList.filter(p => preferences.permissionsStatus?.[p.id] ?? true).length}/6 مكتملة
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">لوحة الأذونات التفاعلية (6 أذونات)</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  متابعة وتفعيل كافة الصلاحيات الضرورية للأذان وشاشة القفل
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                🛡️
              </div>
            </div>
          </div>

          {openSections.permissions && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-3 animate-fade-in">
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                تأكد من تفعيل الأذونات لضمان انطلاق الأذان وشاشة الحظر حتى لو كانت الشاشة مغلقة:
              </p>

              <div className="space-y-2.5">
                {permissionsList.map((perm) => {
                  const isGranted = preferences.permissionsStatus?.[perm.id] ?? true;

                  return (
                    <div
                      key={perm.id}
                      className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between gap-3"
                    >
                      {/* Left: 'ممنوح' button */}
                      <button
                        onClick={() => togglePermission(perm.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isGranted
                            ? 'bg-emerald-950/80 border-emerald-400/70 text-emerald-200 shadow-sm'
                            : 'bg-red-950/80 border-red-400/70 text-red-200'
                        }`}
                      >
                        {isGranted ? 'ممنوح' : 'تفعيل'}
                      </button>

                      {/* Right: Title & Subtitle with Checkmark */}
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold text-xs text-white">{perm.title}</span>
                          <span className={isGranted ? 'text-emerald-400' : 'text-stone-500'}>
                            {isGranted ? '✅' : '⚪'}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/60 mt-0.5 leading-relaxed">
                          {perm.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CARD 5: مركز المظهر والثيمات والخطوط 🎨 (Matching Screenshot Exactly) */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('theme')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.theme ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-white/5 border border-emerald-500/20 text-white text-xs font-bold">
                {preferences.themePreset === 'oled' ? 'ليلي OLED 🖤' :
                 preferences.themePreset === 'emerald' ? 'أخضر إسلامي 🕌' :
                 preferences.themePreset === 'glass' ? 'زجاجي فاخر 💎' : 'لؤلؤي فاتح ☀️'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">مركز المظهر والثيمات والخطوط</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  تخصيص ألوان الواجهات، الخطوط، والأيقونات
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                🎨
              </div>
            </div>
          </div>

          {openSections.theme && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-4 animate-fade-in">
              {/* Section 1: نمط وثيم التطبيق */}
              <div className="space-y-2">
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">نمط وثيم التطبيق (Theme Preset):</span>
                  <span className="text-[10px] text-emerald-400/60">اختر التنسيق البصري المفضل لديك ليتم تطبيقه فورياً:</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'emerald',
                      label: 'الأخضر الإسلامي',
                      subtitle: 'زمردي ملكي فخم',
                      icon: '🕌',
                      previewBg: 'bg-gradient-to-br from-[#0a3324] to-[#04160f]',
                      borderAccent: 'border-emerald-400/40',
                    },
                    {
                      id: 'glass',
                      label: 'الزجاجي الفاخر',
                      subtitle: 'بلور مائي مضيء',
                      icon: '💎',
                      previewBg: 'bg-gradient-to-br from-[#12382c]/80 to-[#071912]/80 backdrop-blur-md',
                      borderAccent: 'border-white/30',
                    },
                    {
                      id: 'oled',
                      label: 'الليلي الفاحم OLED',
                      subtitle: 'سواد أبنوسي نقي',
                      icon: '🖤',
                      previewBg: 'bg-[#000000]',
                      borderAccent: 'border-amber-400/40',
                    },
                    {
                      id: 'light',
                      label: 'اللؤلؤي العاجي',
                      subtitle: 'نقاء نهاري مشرق',
                      icon: '☀️',
                      previewBg: 'bg-gradient-to-br from-[#ffffff] to-[#e8efe9] text-stone-900',
                      borderAccent: 'border-stone-300',
                    },
                  ].map((th) => {
                    const isSel = (preferences.themePreset || 'oled') === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => {
                          const newMode = th.id === 'light' ? 'light' : (preferences.themeMode === 'light' ? 'dark' : preferences.themeMode);
                          onUpdatePreferences({
                            ...preferences,
                            themePreset: th.id as 'emerald' | 'glass' | 'oled' | 'light',
                            themeMode: newMode,
                          });
                        }}
                        style={
                          isSel
                            ? {
                                borderColor: 'var(--accent-border)',
                                boxShadow: '0 8px 25px -4px var(--accent-glow), inset 0 1px 1px rgba(255,255,255,0.15)',
                              }
                            : undefined
                        }
                        className={`p-3 rounded-2xl border transition-all text-right flex items-center justify-between group active:scale-[0.98] ${
                          isSel
                            ? 'bg-[#0f2a22] border-2 text-white shadow-xl'
                            : 'bg-black/40 border-emerald-500/20 text-emerald-200/90 hover:bg-black/60'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                            <span>{th.label}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400/70 block">{th.subtitle}</span>
                        </div>

                        {/* Mini Theme Swatch Orb */}
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0 shadow-inner ${th.previewBg} ${th.borderAccent}`}
                        >
                          <span>{th.icon}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: اللون المميز (Gemstones) */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-xs text-white block text-right">اللون المميز الفاخر (Accent Gemstone):</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      id: 'gold',
                      name: 'ذهب ملكي',
                      subtitle: 'Imperial Gold',
                      gradient: 'from-amber-300 via-amber-400 to-amber-600',
                      hex: '#f59e0b',
                    },
                    {
                      id: 'mint',
                      name: 'زمرد مشرق',
                      subtitle: 'Royal Mint',
                      gradient: 'from-emerald-300 via-emerald-400 to-emerald-600',
                      hex: '#10b981',
                    },
                    {
                      id: 'blue',
                      name: 'ياقوت أزرق',
                      subtitle: 'Sapphire Blue',
                      gradient: 'from-blue-300 via-blue-500 to-blue-700',
                      hex: '#3b82f6',
                    },
                    {
                      id: 'purple',
                      name: 'جمشت ملكي',
                      subtitle: 'Amethyst Silk',
                      gradient: 'from-purple-300 via-purple-500 to-purple-700',
                      hex: '#a855f7',
                    },
                  ].map((c) => {
                    const isSel = (preferences.accentColorPreset || 'mint') === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() =>
                          onUpdatePreferences({
                            ...preferences,
                            accentColorPreset: c.id as 'gold' | 'mint' | 'blue' | 'purple',
                          })
                        }
                        style={
                          isSel
                            ? {
                                borderColor: c.hex,
                                boxShadow: `0 0 16px ${c.hex}66, inset 0 1px 1px rgba(255,255,255,0.2)`,
                              }
                            : undefined
                        }
                        className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                          isSel ? 'bg-black/70 border-2' : 'bg-black/40 border-emerald-500/20 hover:bg-black/50'
                        }`}
                      >
                        {/* Jewel Gem Orb with ring */}
                        <div
                          className={`w-7 h-7 rounded-full bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-xs font-black text-black shadow-md border-2 border-white/30 transition-transform ${
                            isSel ? 'scale-110 shadow-lg' : ''
                          }`}
                        >
                          {isSel && '✓'}
                        </div>
                        <span className="text-[10px] text-white font-bold whitespace-nowrap">{c.name}</span>
                        <span className="text-[8px] opacity-60 font-mono -mt-1">{c.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: حجم الخط العام في التطبيق */}
              <div className="space-y-2 pt-1">
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">حجم الخط العام في التطبيق (Font Scale):</span>
                  <span className="text-[10px] text-emerald-400/60">تكبير أو تصغير النصوص لتناسب راحة القراءة لديك:</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '88', label: 'صغير (%88)' },
                    { id: '100', label: 'عادي (%100)' },
                    { id: '115', label: 'كبير (%115)' },
                    { id: '130', label: 'كبير جداً (%130)' },
                  ].map((fs) => {
                    const isSel = (preferences.fontScaleLevel || '100') === fs.id;
                    return (
                      <button
                        key={fs.id}
                        onClick={() =>
                          onUpdatePreferences({
                            ...preferences,
                            fontScaleLevel: fs.id as '88' | '100' | '115' | '130',
                          })
                        }
                        style={isSel ? { borderColor: 'var(--accent-color)', backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' } : undefined}
                        className={`p-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          isSel ? 'shadow-md' : 'bg-black/30 border-emerald-500/20 text-emerald-300 hover:bg-black/50'
                        }`}
                      >
                        {fs.label}
                      </button>
                    );
                  })}
                </div>

                {/* Font Preview Box */}
                <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 text-center space-y-1">
                  <span className="text-[10px] text-emerald-400/70 block">معاينة حجم الخط الحالي: 📖</span>
                  <p
                    className="font-serif font-bold transition-all"
                    style={{
                      fontSize: `${(parseInt(preferences.fontScaleLevel || '100', 10) / 100) * 1.15}rem`,
                      color: 'var(--accent-color)',
                    }}
                  >
                    «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
                  </p>
                </div>
              </div>

              {/* Section 4: وضع الإضاءة */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-xs text-white block text-right">وضع الإضاءة (Light / Dark Mode):</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light' as const, label: 'فاتح ☀️' },
                    { id: 'dark' as const, label: 'ليلي 🌙' },
                    { id: 'system' as const, label: 'تلقائي ⚙️' },
                  ].map((m) => {
                    const isSel = (preferences.themeMode || 'dark') === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          const newPreset = m.id === 'light'
                            ? 'light'
                            : (preferences.themePreset === 'light' ? 'oled' : preferences.themePreset);
                          onUpdatePreferences({
                            ...preferences,
                            themeMode: m.id,
                            themePreset: newPreset,
                          });
                        }}
                        style={isSel ? { borderColor: 'var(--accent-border)', color: 'var(--accent-color)' } : undefined}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                          isSel
                            ? 'bg-[#0f2a22] border-2 shadow-md'
                            : 'bg-black/30 border-emerald-500/20 text-emerald-300 hover:bg-black/50'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: أيقونة التطبيق للشاشة الرئيسية */}
              <div className="space-y-2 pt-1">
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">أيقونة التطبيق للشاشة الرئيسية:</span>
                  <span className="text-[10px] text-emerald-400/60">اختر تصميم الأيقونة المفضل لديك:</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'mihrab', label: 'المحراب الزمردي', icon: '🕌' },
                    { id: 'kaaba', label: 'الكعبة المشرفة', icon: '🕋' },
                    { id: 'quran', label: 'المصحف الشريف', icon: '📖' },
                    { id: 'rug', label: 'سجادة الصلاة', icon: '🧎' },
                  ].map((ico) => {
                    const isSel = (preferences.appIconStyle || 'mihrab') === ico.id;
                    return (
                      <button
                        key={ico.id}
                        onClick={() =>
                          onUpdatePreferences({
                            ...preferences,
                            appIconStyle: ico.id as 'mihrab' | 'kaaba' | 'quran' | 'rug',
                          })
                        }
                        style={isSel ? { borderColor: 'var(--accent-color)', boxShadow: '0 0 10px var(--accent-glow)' } : undefined}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all ${
                          isSel
                            ? 'bg-[#0f2a22] text-teal-200 border-2'
                            : 'bg-black/40 border-emerald-500/20 text-emerald-300 hover:bg-black/60'
                        }`}
                      >
                        <span className="text-2xl">{ico.icon}</span>
                        <span className="text-[9px] text-center font-serif leading-tight">{ico.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 6: مركز تخصيص وإعدادات الويجت 📱 (Matching Screenshot Exactly) */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('widget')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.widget ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                مفعّل 🟢
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">مركز تخصيص وإعدادات الويجت</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  التحكم في تفعيل، ثيم، خطوط، وقوالب الويجت
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                📱
              </div>
            </div>
          </div>

          {openSections.widget && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-4 animate-fade-in">
              {/* Enable Widget Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
                <button
                  onClick={() =>
                    onUpdatePreferences({
                      ...preferences,
                      isWidgetActive: !preferences.isWidgetActive,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    preferences.isWidgetActive ? 'bg-teal-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      preferences.isWidgetActive ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                    }`}
                  />
                </button>

                <div className="text-right">
                  <span className="font-bold text-xs text-white block">تفعيل الويجت المصغر للشاشة الرئيسية</span>
                  <span className="text-[10px] text-emerald-400/60">
                    إظهار وتحديث مواقيت الصلاة والعد التنازلي على شاشة الهاتف
                  </span>
                </div>
              </div>

              {/* Widget Background Theme */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-white block text-right">نمط خلفية وثيم الويجت:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'glass', label: 'زجاجي بلوري 💎' },
                    { id: 'oled', label: 'ليلي فاحم 🌑' },
                    { id: 'emerald', label: 'أخضر زمردي 🕌' },
                    { id: 'light', label: 'فاتح هادئ ☀️' },
                  ].map((wth) => (
                    <button
                      key={wth.id}
                      onClick={() =>
                        onUpdatePreferences({
                          ...preferences,
                          widgetTheme: wth.id as 'glass' | 'oled' | 'emerald' | 'light',
                        })
                      }
                      className={`p-2 rounded-xl text-[10px] font-bold border ${
                        preferences.widgetTheme === wth.id
                          ? 'bg-teal-800 border-teal-400 text-white'
                          : 'bg-black/30 border-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {wth.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget Templates */}
              <div className="space-y-2">
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">قوالب ونماذج تخطيط الويجت (Widget Templates):</span>
                  <span className="text-[10px] text-emerald-400/60">
                    اختر شكل وترتيب عرض مواقيت الصلاة والعد التنازلي على شاشتك الرئيسية:
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'horizontal', label: 'أفقي شامل (5 صلوات) ⏱️', icon: '⏱️' },
                    { id: 'compact', label: 'عمودي بطاقة مدمجة 📱', icon: '📱' },
                    { id: 'minimal', label: 'مصغر (الصلاة القادمة) ⏲️', icon: '⏲️' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() =>
                        onUpdatePreferences({
                          ...preferences,
                          widgetTemplate: tpl.id as 'horizontal' | 'compact' | 'minimal',
                        })
                      }
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border ${
                        preferences.widgetTemplate === tpl.id
                          ? 'bg-[#0f2a22] border-teal-400 text-teal-200'
                          : 'bg-black/30 border-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      <span className="text-lg">{tpl.icon}</span>
                      <span className="text-[10px] text-center font-bold">{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reorder Elements */}
              <div className="space-y-2">
                <div className="text-right">
                  <span className="font-bold text-xs text-white block">ترتيب أماكن عناصر الويجت (Reorder Elements):</span>
                  <span className="text-[10px] text-emerald-400/60">حدد الترتيب الرأسي المفضل لعناصر الويجت من الأعلى للأسفل:</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: '1_header_2_countdown_3_prayers', label: '1. الهيدر ⬅️ 2. العد التنازلي ⬅️ 3. الصلوات' },
                    { id: '1_countdown_2_header_3_prayers', label: '1. العد التنازلي ⬅️ 2. الهيدر ⬅️ 3. الصلوات' },
                    { id: '1_header_2_prayers_3_countdown', label: '1. الهيدر ⬅️ 2. الصلوات ⬅️ 3. العد التنازلي' },
                  ].map((ord) => (
                    <button
                      key={ord.id}
                      onClick={() =>
                        onUpdatePreferences({
                          ...preferences,
                          widgetElementsOrder: ord.id,
                        })
                      }
                      className={`w-full p-2.5 rounded-xl border text-right text-xs font-mono flex items-center justify-between ${
                        preferences.widgetElementsOrder === ord.id
                          ? 'bg-teal-950/80 border-teal-400 text-teal-200'
                          : 'bg-black/30 border-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      <span>{ord.label}</span>
                      <span>{preferences.widgetElementsOrder === ord.id ? '🔘' : '⚪'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget Font Size */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-white block text-right">حجم خطوط ونصوص الويجت:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '100', label: 'عادي (%100)' },
                    { id: '120', label: 'كبير (%120)' },
                    { id: '140', label: 'ضخم (%140)' },
                  ].map((wfs) => (
                    <button
                      key={wfs.id}
                      onClick={() =>
                        onUpdatePreferences({
                          ...preferences,
                          widgetFontScale: wfs.id as '100' | '120' | '140',
                        })
                      }
                      className={`p-2 rounded-xl text-xs font-mono font-bold border ${
                        preferences.widgetFontScale === wfs.id
                          ? 'bg-teal-700 text-white border-teal-400'
                          : 'bg-black/30 border-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {wfs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget Display Toggles */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-white block text-right">تخصيص عناصر الويجت المعروضة:</span>

                <div className="space-y-2">
                  {[
                    {
                      key: 'widgetShowHijri' as const,
                      title: 'عرض التاريخ الهجري',
                      sub: 'عرض التقويم الهجري المبارك بأعلى الويجت',
                    },
                    {
                      key: 'widgetShowCity' as const,
                      title: 'عرض اسم المدينة والموقع',
                      sub: 'عرض المدينة المحددة لحساب التوقيت الفلكي',
                    },
                    {
                      key: 'widgetShowAzkarBtn' as const,
                      title: 'عرض زر الأذكار السريع',
                      sub: 'زر اختصار مباشر لفتح أذكار الصباح والمساء من الويجت',
                    },
                    {
                      key: 'widgetShowPrayersSummary' as const,
                      title: 'عرض ملخص جدول الصلوات الخمس',
                      sub: 'جدول مصغر لأوقات الفجر، الظهر، العصر، المغرب، والعشاء',
                    },
                  ].map((tog) => (
                    <div
                      key={tog.key}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10"
                    >
                      <button
                        onClick={() =>
                          onUpdatePreferences({
                            ...preferences,
                            [tog.key]: !preferences[tog.key],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences[tog.key] ? 'bg-teal-500' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences[tog.key] ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                          }`}
                        />
                      </button>

                      <div className="text-right">
                        <span className="font-bold text-xs text-white block">{tog.title}</span>
                        <span className="text-[10px] text-emerald-400/60">{tog.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Live Widget Preview (Matching Screenshot 4 One UI Home) */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-bold">معاينة شكل الويجت الحقيقية على شاشة الهاتف (One UI):</span>
                  <span className="text-[10px] text-emerald-300 font-mono px-2 py-0.5 rounded-full bg-black/40 border border-emerald-500/20">
                    حق الله V2.7 🕌
                  </span>
                </div>

                <HomeWidgetCard
                  preferences={preferences}
                  prayerTimes={null}
                  countdownFormatted="٤:٠٧:٢٤"
                  nextPrayerArabicName="صلاة الفجر"
                  nextPrayerTimeFormatted="٠٤:٤٦ ص"
                />
              </div>

              {/* Update & Sync Widget Button */}
              <button
                onClick={() => alert('تمت مزامنة بيانات الويجت وتحديث الجداول بنجاح!')}
                className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50"
              >
                <span>تحديث ومزامنة الويجت فوراً</span>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CARD 7: الموقع والحساب والتوقيت الصيفي 📍 */}
        <div className="rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 overflow-hidden shadow-md">
          <div
            onClick={() => toggleSection('location')}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform ${
                  openSections.location ? 'rotate-180 text-amber-400' : ''
                }`}
              />
              <span className="px-3 py-1 rounded-full bg-white/5 border border-emerald-500/30 text-amber-300 text-xs font-bold">
                {preferences.selectedCity.cityNameAr}
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h3 className="font-bold text-sm text-white">الموقع والحساب والتوقيت الصيفي</h3>
                <p className="text-[10px] text-emerald-400/60 mt-0.5">
                  {preferences.selectedCity.cityNameAr} ▪ {preferences.selectedCity.countryNameAr}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-center text-lg">
                📍
              </div>
            </div>
          </div>

          {openSections.location && (
            <div className="px-4 pb-4 pt-1 border-t border-emerald-500/10 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-200">التحديد التلقائي عبر الـ GPS:</span>
                <button
                  onClick={onDetectGps}
                  disabled={isGpsLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MapPin className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-bounce' : ''}`} />
                  <span>تحديث GPS</span>
                </button>
              </div>

              {/* City Search & Select */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-emerald-400/60" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="ابحث عن مدينة..."
                    className="w-full pr-8 pl-3 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {filteredCities.slice(0, 10).map((city) => (
                    <button
                      key={city.cityNameAr}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between ${
                        preferences.selectedCity.cityNameAr === city.cityNameAr
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40'
                          : 'bg-black/20 text-emerald-200 hover:bg-black/40'
                      }`}
                    >
                      <span>{city.cityNameAr} ({city.countryNameAr})</span>
                      {preferences.selectedCity.cityNameAr === city.cityNameAr && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. WhatsApp Channel Banner Card (Real Link) */}
      <a
        href="https://whatsapp.com/channel/0029VbDPK3O7oQhhtdF0Ty16"
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded-3xl bg-[#fefdfb] border border-amber-200/80 text-stone-900 shadow-xl flex items-center justify-between hover:bg-amber-50/90 transition-all cursor-pointer block"
      >
        <div className="flex items-center justify-between w-full">
          <div className="p-2 text-emerald-600">
            <ChevronDown className="w-4 h-4 rotate-90" />
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <h4 className="font-serif font-black text-sm text-stone-900">
                قناة «خواطر وتأملات» على واتساب
              </h4>
              <p className="text-[11px] text-stone-600 mt-0.5">
                هذه قناتي، إذا وجدت تحديثات هنزلها هنا 📲
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
              📢
            </div>
          </div>
        </div>
      </a>

      {/* 4. Footer Developer Card (Real Phone & WhatsApp) */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2">
          <a
            href="tel:01030703861"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-emerald-500/30 text-white text-xs font-bold active:scale-95 transition-all"
            title="اتصال مباشر بالهاتف"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>اتصال</span>
          </a>

          <a
            href="https://wa.me/201030703861"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
            title="مراسلة عبر واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-emerald-400/60 block">تطوير وإشراف:</span>
          <div className="font-bold text-xs text-amber-300 font-serif">
            طالب علم 🌿
          </div>
        </div>
      </div>
    </div>
  );
};
