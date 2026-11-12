export type PrayerName = 'FAJR' | 'SUNRISE' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA';

export interface PrayerTypeInfo {
  name: PrayerName;
  arabicName: string;
  englishName: string;
  isFard: boolean;
}

export const PRAYER_DEFINITIONS: Record<PrayerName, PrayerTypeInfo> = {
  FAJR: { name: 'FAJR', arabicName: 'الفجر', englishName: 'Fajr', isFard: true },
  SUNRISE: { name: 'SUNRISE', arabicName: 'الشروق', englishName: 'Sunrise', isFard: false },
  DHUHR: { name: 'DHUHR', arabicName: 'الظهر', englishName: 'Dhuhr', isFard: true },
  ASR: { name: 'ASR', arabicName: 'العصر', englishName: 'Asr', isFard: true },
  MAGHRIB: { name: 'MAGHRIB', arabicName: 'المغرب', englishName: 'Maghrib', isFard: true },
  ISHA: { name: 'ISHA', arabicName: 'العشاء', englishName: 'Isha', isFard: true },
};

export interface PrayerTime {
  type: PrayerName;
  arabicName: string;
  timestamp: number;
  timeFormatted: string;
  isCurrent: boolean;
  isNext: boolean;
  isCompleted: boolean;
}

export interface CityLocation {
  cityNameAr: string;
  cityNameEn: string;
  countryNameAr: string;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  defaultMethod: number;
}

export interface PrayerSpiritualDetail {
  prayerType: PrayerName;
  quranVerse: string;
  quranSurah: string;
  hadith: string;
  spiritualTip: string;
  virtue: string;
}

export interface MissedReason {
  id: string;
  title: string;
  iconEmoji: string;
  guidanceTitle: string;
  guidanceText: string;
  scripture: string;
  actionHint: string;
}

export interface ZikrCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface ZikrItem {
  id: number;
  text: string;
  targetCount: number;
  currentCount: number;
  virtue: string;
  source: string;
  category: string;
  isCustom?: boolean;
}

export interface VoluntarySunnahItem {
  id: string;
  titleAr: string;
  rakatsText: string;
  virtueAr: string;
  iconEmoji: string;
}

export type PrayerLogStatusType = 'pending' | 'on_time' | 'late' | 'excused' | 'missed';

export interface LegitimateExcuse {
  id: string;
  titleAr: string;
  iconEmoji: string;
  descriptionAr: string;
  fiqhRule: string;
}

export interface DailyPrayerRecord {
  dateStr: string; // yyyy-MM-dd
  prayerStatuses: Record<string, PrayerLogStatusType>;
  prayerExcuses: Record<string, string>;
  prayerNotes: Record<string, string>;
  morningAzkarDone: boolean;
  eveningAzkarDone: boolean;
  sleepAzkarDone: boolean;
  afterPrayerAzkarDone: boolean;
  dailyReflection: string;
  voluntarySunnahDone: Record<string, boolean>;
  quranWirdPagesRead: number;
  quranWirdTargetPages: number;
  quranWirdTargetType: 'pages' | 'ayahs' | 'ajzaa';
  quranWirdTargetAyahs: number;
  quranWirdAyahsRead: number;
  quranWirdSurah: string;
  quranWirdAyah: number;
  quranWirdCompleted: boolean;
}

export interface TrackerSummaryStats {
  totalTrackedDays: number;
  onTimeCount: number;
  lateCount: number;
  excusedCount: number;
  missedCount: number;
  totalPrayersLogged: number;
  onTimePercentage: number;
  azkarStreakDays: number;
  completedAzkarCount: number;
  totalSunnahCount: number;
  totalQuranPagesRead: number;
}

export interface DailyRatingResult {
  fardPoints: number;
  starCount: number;
  isSixthStarUnlocked: boolean;
  voluntaryPoints: number;
  totalPoints: number;
  feedbackTitle: string;
  feedbackDescription: string;
}

export interface QuranSurahMeta {
  number: number;
  nameAr: string;
  nameEn: string;
  type: string;
  versesCount: number;
  startPage: number;
}

export interface QuranAyahData {
  s: number;        // surah number
  sName: string;    // surah name
  sType: string;    // Makki / Madani
  sCount: number;   // total ayahs in surah
  a: number;        // ayah number
  t: string;        // text
  j: number;        // juz
  h: number;        // hizb
  sajda?: boolean;
}

export type HaqqAllahTabType = 'prayers' | 'tracker' | 'azkar' | 'quran' | 'settings';

export type LockdownStepType = 'QUESTION_PRAYED' | 'QUESTION_REASON' | 'GUIDANCE_ADVICE' | 'COMPLETED_BLESSING';

export interface UserPreferences {
  themeMode: 'system' | 'dark' | 'light';
  themePreset: 'emerald' | 'glass' | 'oled' | 'light';
  accentColorPreset: 'gold' | 'mint' | 'blue' | 'purple';
  fontScaleLevel: '88' | '100' | '115' | '130';
  selectedCity: CityLocation;
  calculationMethod: number;
  madhab: 'standard' | 'hanafi';
  manualOffsetMinutes: number;
  isDaylightSaving: boolean;
  hijriDateOffsetDays: number;
  adhanSound: 'default' | 'makkah' | 'madinah' | 'alaqsa' | 'abdulbasit' | 'mishary' | 'gentle_chime';
  adhanVolume: number;
  isFajrTatweebEnabled: boolean;
  adhanEnabledPrayers: Record<PrayerName, boolean>;
  prayerCustomAdhans: Record<PrayerName, string>;
  isBackgroundWorkActive: boolean;
  isWidgetActive: boolean;
  widgetTheme: 'glass' | 'oled' | 'emerald' | 'light';
  widgetTemplate: 'horizontal' | 'compact' | 'minimal';
  widgetElementsOrder: string;
  widgetFontScale: '100' | '120' | '140';
  widgetShowHijri: boolean;
  widgetShowCity: boolean;
  widgetShowAzkarBtn: boolean;
  widgetShowPrayersSummary: boolean;
  appIconStyle: 'mihrab' | 'kaaba' | 'quran' | 'rug';
  permissionsStatus: Record<string, boolean>;
  customAdhanFileName: string;
  isMorningAzkarReminder: boolean;
  isEveningAzkarReminder: boolean;
  isSleepAzkarReminder: boolean;
  morningReminderTime: string;
  eveningReminderTime: string;
  sleepReminderTime: string;
  lockdownEnabled: boolean;
  lockdownDurationMinutes: number;
  quranNightMode: boolean;
  quranFontSize: number;
  quranLastPage: number;
  quranBookmarks: number[];
}
