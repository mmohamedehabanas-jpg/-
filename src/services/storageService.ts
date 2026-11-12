import {
  DailyPrayerRecord,
  DailyRatingResult,
  PrayerLogStatusType,
  TrackerSummaryStats,
  UserPreferences,
  ZikrItem
} from '../types';
import { INITIAL_AZKAR, PREDEFINED_CITIES } from '../data/islamicData';

const PREFS_KEY = 'haqq_allah_prefs_v2_7';
const AZKAR_KEY = 'haqq_allah_azkar_v2_7';
const TRACKER_KEY = 'haqq_allah_tracker_v2_7';

export const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'dark',
  themePreset: 'oled',
  accentColorPreset: 'mint',
  fontScaleLevel: '100',
  selectedCity: PREDEFINED_CITIES.find(c => c.cityNameAr === 'ميت غمر') || PREDEFINED_CITIES[0],
  calculationMethod: 5, // Egyptian General Authority of Survey
  madhab: 'standard',
  manualOffsetMinutes: 0,
  isDaylightSaving: false,
  hijriDateOffsetDays: 0,
  adhanSound: 'default',
  adhanVolume: 0.85,
  isFajrTatweebEnabled: true,
  adhanEnabledPrayers: {
    FAJR: true,
    SUNRISE: false,
    DHUHR: true,
    ASR: true,
    MAGHRIB: true,
    ISHA: true,
  },
  prayerCustomAdhans: {
    FAJR: 'default',
    SUNRISE: 'default',
    DHUHR: 'default',
    ASR: 'default',
    MAGHRIB: 'default',
    ISHA: 'default',
  },
  isBackgroundWorkActive: true,
  isWidgetActive: true,
  widgetTheme: 'glass',
  widgetTemplate: 'horizontal',
  widgetElementsOrder: '1_header_2_countdown_3_prayers',
  widgetFontScale: '100',
  widgetShowHijri: true,
  widgetShowCity: true,
  widgetShowAzkarBtn: true,
  widgetShowPrayersSummary: true,
  appIconStyle: 'mihrab',
  permissionsStatus: {
    gps: true,
    exact_alarms: true,
    battery_bypass: true,
    notifications: true,
    overlay: true,
    storage: true,
  },
  customAdhanFileName: 'Nur-alaa-_______-_________-_________50062c39.mp3',
  isMorningAzkarReminder: true,
  isEveningAzkarReminder: true,
  isSleepAzkarReminder: true,
  morningReminderTime: '06:30 ص',
  eveningReminderTime: '04:45 م',
  sleepReminderTime: '11:00 م',
  lockdownEnabled: true,
  lockdownDurationMinutes: 15,
  quranNightMode: true,
  quranFontSize: 24,
  quranLastPage: 602,
  quranBookmarks: [602],
};

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyDailyRecord(dateStr: string): DailyPrayerRecord {
  return {
    dateStr,
    prayerStatuses: {
      FAJR: 'pending',
      DHUHR: 'pending',
      ASR: 'pending',
      MAGHRIB: 'pending',
      ISHA: 'pending',
    },
    prayerExcuses: {},
    prayerNotes: {},
    morningAzkarDone: false,
    eveningAzkarDone: false,
    sleepAzkarDone: false,
    afterPrayerAzkarDone: false,
    dailyReflection: '',
    voluntarySunnahDone: {},
    quranWirdPagesRead: 0,
    quranWirdTargetPages: 20,
    quranWirdTargetType: 'pages',
    quranWirdTargetAyahs: 10,
    quranWirdAyahsRead: 0,
    quranWirdSurah: 'سورة الفاتحة',
    quranWirdAyah: 1,
    quranWirdCompleted: false,
  };
}

// Preferences
export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

// Azkar
export function loadAzkarItems(): ZikrItem[] {
  if (typeof window === 'undefined') return INITIAL_AZKAR;
  try {
    const raw = localStorage.getItem(AZKAR_KEY);
    if (!raw) {
      saveAzkarItems(INITIAL_AZKAR);
      return INITIAL_AZKAR;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AZKAR;
  } catch {
    return INITIAL_AZKAR;
  }
}

export function saveAzkarItems(items: ZikrItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AZKAR_KEY, JSON.stringify(items));
  } catch {}
}

// Tracker Records
export function loadAllTrackerRecords(): Record<string, DailyPrayerRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function loadDailyRecord(dateStr: string): DailyPrayerRecord {
  const all = loadAllTrackerRecords();
  if (all[dateStr]) {
    return all[dateStr];
  }
  const newRec = createEmptyDailyRecord(dateStr);
  all[dateStr] = newRec;
  saveAllTrackerRecords(all);
  return newRec;
}

export function saveDailyRecord(record: DailyPrayerRecord): void {
  const all = loadAllTrackerRecords();
  all[record.dateStr] = record;
  saveAllTrackerRecords(all);
}

export function saveAllTrackerRecords(records: Record<string, DailyPrayerRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(records));
  } catch {}
}

/**
 * Calculates Daily Rating and the 6th Star of Devotion (النجمة السادسة للتطوع والإحسان)
 */
export function calculateDailyRating(record: DailyPrayerRecord): DailyRatingResult {
  const fardPrayers = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
  let fardPoints = 0;

  fardPrayers.forEach(pName => {
    const status: PrayerLogStatusType = record.prayerStatuses[pName] || 'pending';
    if (status === 'on_time') {
      fardPoints += 20;
    } else if (status === 'excused') {
      fardPoints += 20; // Sharia legitimate excuse grants full points
    } else if (status === 'late') {
      fardPoints += 12;
    }
  });

  const starCount =
    fardPoints >= 95 ? 5 :
    fardPoints >= 75 ? 4 :
    fardPoints >= 55 ? 3 :
    fardPoints >= 35 ? 2 :
    fardPoints >= 15 ? 1 : 0;

  // Voluntary points
  const sunnahDoneCount = Object.values(record.voluntarySunnahDone || {}).filter(Boolean).length;
  const sunnahPoints = sunnahDoneCount * 10;

  const azkarDoneCount = [
    record.morningAzkarDone,
    record.eveningAzkarDone,
    record.sleepAzkarDone,
    record.afterPrayerAzkarDone,
  ].filter(Boolean).length;
  const azkarPoints = azkarDoneCount * 5;

  const isQuranDone =
    record.quranWirdCompleted ||
    (record.quranWirdTargetType === 'ayahs' && record.quranWirdAyahsRead >= record.quranWirdTargetAyahs && record.quranWirdAyahsRead > 0) ||
    (record.quranWirdPagesRead >= record.quranWirdTargetPages && record.quranWirdPagesRead > 0);

  const quranPoints = isQuranDone ? 25 : Math.min(25, record.quranWirdPagesRead * 1);
  const voluntaryPoints = sunnahPoints + azkarPoints + quranPoints;
  const totalPoints = fardPoints + voluntaryPoints;

  // 6th Star of Devotion Unlocked!
  const isSixthStarUnlocked =
    (sunnahDoneCount >= 2) ||
    (sunnahDoneCount >= 1 && (isQuranDone || azkarDoneCount >= 2)) ||
    (isQuranDone && azkarDoneCount >= 2);

  let feedbackTitle = 'أقم صلاتك، الصلاة عماد الدين';
  let feedbackDescription = 'حافظ على صلواتك الخمس في وقتها، واستحضر عظمة الوقوف بين يدي الله تعالى.';

  if (isSixthStarUnlocked && starCount === 5) {
    feedbackTitle = 'تاج الإحسان والتطوع (6 نجوم كاملة) 👑';
    feedbackDescription = 'جمعت بين إقامة الفروض الخمسة في أوقاتها وأداء السنن والنوافل وورد القرآن الكريم! «ولا يزال عبدي يتقرب إلي بالنوافل حتى أحبه».';
  } else if (isSixthStarUnlocked) {
    feedbackTitle = 'أضاءت النجمة السادسة للتطوع 🌟';
    feedbackDescription = 'أضاءت النجمة السادسة الاستثنائية بفضل نوافلك وطاعاتك التطوعية! استكمل باقي الصلوات المفروضة لتصل لدرجة الإحسان التام.';
  } else if (starCount === 5) {
    feedbackTitle = 'مبارك! 5 نجوم ذهبية في الفروض ⭐';
    feedbackDescription = 'أديت الفروض الخمسة كاملة بحمد الله! أقبل الآن على السنن والنوافل وورد القرآن لإضاءة النجمة السادسة الاستثنائية 🌟.';
  } else if (starCount >= 4) {
    feedbackTitle = 'أداء مبارك وجيد جداً 🌿';
    feedbackDescription = 'خطوات مباركة ومتقنة في المحافظة على الصلاة. جاهد نفسك لإتمام الصلوات الخمس في أوقاتها.';
  } else if (starCount >= 3) {
    feedbackTitle = 'بداية طيبة، استعن بالله 🤲';
    feedbackDescription = 'الحمد لله على ما وُفقت إليه، اجعل الصلاة أول أولوياتك وتذكر أن التوفيق ببركتها.';
  } else if (starCount >= 1) {
    feedbackTitle = 'واصل المحافظة على الفروض 🕌';
    feedbackDescription = 'كل صلاة تؤديها نور في قلبك وحصن لك، لا تتكاسل واستمر في المجاهدة.';
  }

  return {
    fardPoints,
    starCount,
    isSixthStarUnlocked,
    voluntaryPoints,
    totalPoints,
    feedbackTitle,
    feedbackDescription,
  };
}

export function calculateSummaryStats(records: Record<string, DailyPrayerRecord>): TrackerSummaryStats {
  const dates = Object.keys(records);
  if (dates.length === 0) {
    return {
      totalTrackedDays: 1,
      onTimeCount: 0,
      lateCount: 0,
      excusedCount: 0,
      missedCount: 0,
      totalPrayersLogged: 0,
      onTimePercentage: 0,
      azkarStreakDays: 0,
      completedAzkarCount: 0,
      totalSunnahCount: 0,
      totalQuranPagesRead: 0,
    };
  }

  let onTimeCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let missedCount = 0;
  let totalSunnahCount = 0;
  let completedAzkarCount = 0;
  let totalQuranPagesRead = 0;

  dates.forEach(d => {
    const rec = records[d];
    Object.values(rec.prayerStatuses).forEach(status => {
      if (status === 'on_time') onTimeCount++;
      else if (status === 'late') lateCount++;
      else if (status === 'excused') excusedCount++;
      else if (status === 'missed') missedCount++;
    });

    totalSunnahCount += Object.values(rec.voluntarySunnahDone || {}).filter(Boolean).length;
    if (rec.morningAzkarDone) completedAzkarCount++;
    if (rec.eveningAzkarDone) completedAzkarCount++;
    if (rec.sleepAzkarDone) completedAzkarCount++;
    if (rec.afterPrayerAzkarDone) completedAzkarCount++;
    totalQuranPagesRead += rec.quranWirdPagesRead || 0;
  });

  const totalPrayersLogged = onTimeCount + lateCount + excusedCount + missedCount;
  const onTimePercentage = totalPrayersLogged > 0
    ? Math.round(((onTimeCount + excusedCount) / totalPrayersLogged) * 100)
    : 0;

  // Calculate streak of days with all prayers or azkar
  let azkarStreakDays = 0;
  const sortedDates = [...dates].sort().reverse();
  for (const d of sortedDates) {
    const r = records[d];
    if (r.morningAzkarDone || r.eveningAzkarDone || r.sleepAzkarDone) {
      azkarStreakDays++;
    } else {
      break;
    }
  }

  return {
    totalTrackedDays: Math.max(1, dates.length),
    onTimeCount,
    lateCount,
    excusedCount,
    missedCount,
    totalPrayersLogged,
    onTimePercentage,
    azkarStreakDays,
    completedAzkarCount,
    totalSunnahCount,
    totalQuranPagesRead,
  };
}
