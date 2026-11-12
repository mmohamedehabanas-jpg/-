import { PrayerName, PrayerTime, PRAYER_DEFINITIONS } from '../types';

export interface CalculationOptions {
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  isDaylightSaving?: boolean;
  manualOffsetMinutes?: number;
  methodId?: number;
  madhab?: 'standard' | 'hanafi';
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function toDegrees(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

function fixAngle(a: number): number {
  let res = a - 360.0 * Math.floor(a / 360.0);
  if (res < 0) res += 360.0;
  return res;
}

function fixHour(h: number): number {
  let res = h - 24.0 * Math.floor(h / 24.0);
  if (res < 0) res += 24.0;
  return res;
}

function julianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100.0);
  const b = 2 - a + Math.floor(a / 4.0);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

export function formatTime12h(hour24: number, minute: number): string {
  const h12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const suffix = hour24 >= 12 ? 'م' : 'ص';
  const mStr = minute.toString().padStart(2, '0');
  const hStr = h12.toString().padStart(2, '0');
  return `${hStr}:${mStr} ${suffix}`;
}

export function calculatePrayerTimes(
  date: Date,
  options: CalculationOptions
): PrayerTime[] {
  const {
    latitude,
    longitude,
    timezoneOffsetHours,
    isDaylightSaving = false,
    manualOffsetMinutes = 0,
    methodId = 5,
    madhab = 'standard'
  } = options;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDate(year, month, day) - longitude / (15.0 * 24.0);

  // Method angles
  let fajrAngle = 19.5;
  let ishaAngle = 17.5;
  if (methodId === 1) {
    fajrAngle = 18.0;
    ishaAngle = 17.0;
  } else if (methodId === 2) {
    fajrAngle = 15.0;
    ishaAngle = 15.0;
  } else if (methodId === 4) {
    fajrAngle = 18.5;
    ishaAngle = 0.0; // 90 min interval
  } else if (methodId === 7) {
    fajrAngle = 17.7;
    ishaAngle = 14.0;
  }

  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * Math.sin(toRadians(g)) + 0.02 * Math.sin(toRadians(2 * g)));
  const e = 23.439 - 0.00000036 * d;

  const dRad = toRadians(e);
  const lRad = toRadians(l);
  const sinDec = Math.sin(dRad) * Math.sin(lRad);
  const dec = toDegrees(Math.asin(sinDec));
  const raRad = Math.atan2(Math.cos(dRad) * Math.sin(lRad), Math.cos(lRad));
  const ra = fixAngle(toDegrees(raRad)) / 15.0;
  const eqt = q / 15.0 - ra;

  // Midday / Noon
  const noon = fixHour(12.0 + timezoneOffsetHours - longitude / 15.0 - eqt);

  const latRad = toRadians(latitude);
  const decRad = toRadians(dec);

  // Sunrise & Sunset (center of sun 0.833° below horizon)
  const sunriseAngle = 0.833;
  const cosSun = (-Math.sin(toRadians(sunriseAngle)) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const sunDiff = cosSun >= -1.0 && cosSun <= 1.0 ? toDegrees(Math.acos(cosSun)) / 15.0 : 6.0;
  const sunrise = noon - sunDiff;
  const sunset = noon + sunDiff;

  // Fajr
  const cosFajr = (-Math.sin(toRadians(fajrAngle)) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const fajrDiff = cosFajr >= -1.0 && cosFajr <= 1.0 ? toDegrees(Math.acos(cosFajr)) / 15.0 : 6.5;
  const fajr = noon - fajrDiff;

  // Asr (shadow ratio: 1 for Shafi/Hanbali/Maliki standard, 2 for Hanafi)
  const shadowFactor = madhab === 'hanafi' ? 2.0 : 1.0;
  const asrAngle = -toDegrees(Math.atan(1.0 / (shadowFactor + Math.tan(toRadians(Math.abs(latitude - dec))))));
  const cosAsr = (-Math.sin(toRadians(asrAngle)) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const asrDiff = cosAsr >= -1.0 && cosAsr <= 1.0 ? toDegrees(Math.acos(cosAsr)) / 15.0 : 3.5;
  const asr = noon + asrDiff;

  // Maghrib
  const maghrib = sunset;

  // Isha
  let isha: number;
  if (methodId === 4) {
    isha = maghrib + 1.5; // 90 min after Maghrib in Umm Al-Qura
  } else {
    const cosIsha = (-Math.sin(toRadians(ishaAngle)) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    const ishaDiff = cosIsha >= -1.0 && cosIsha <= 1.0 ? toDegrees(Math.acos(cosIsha)) / 15.0 : 1.5;
    isha = noon + ishaDiff;
  }

  const dstShift = isDaylightSaving ? 1.0 : 0.0;
  const offsetShift = manualOffsetMinutes / 60.0;

  const rawTimes: [PrayerName, number][] = [
    ['FAJR', fajr + dstShift + offsetShift],
    ['SUNRISE', sunrise + dstShift + offsetShift],
    ['DHUHR', noon + dstShift + offsetShift],
    ['ASR', asr + dstShift + offsetShift],
    ['MAGHRIB', maghrib + dstShift + offsetShift],
    ['ISHA', isha + dstShift + offsetShift],
  ];

  const nowMillis = Date.now();
  const prayerTimes: PrayerTime[] = [];

  for (const [type, decHours] of rawTimes) {
    const totalMinutes = Math.round(decHours * 60);
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = ((totalMinutes % 60) + 60) % 60;

    const pDate = new Date(date);
    pDate.setHours(hour, minute, 0, 0);
    const pMillis = pDate.getTime();
    const isPast = nowMillis > pMillis;

    prayerTimes.push({
      type,
      arabicName: PRAYER_DEFINITIONS[type].arabicName,
      timestamp: pMillis,
      timeFormatted: formatTime12h(hour, minute),
      isCurrent: false,
      isNext: false,
      isCompleted: isPast
    });
  }

  // Determine current and next prayer
  // If upcoming today
  let foundNext = false;
  for (let i = 0; i < prayerTimes.length; i++) {
    const pt = prayerTimes[i];
    if (pt.timestamp > nowMillis && pt.type !== 'SUNRISE' && !foundNext) {
      pt.isNext = true;
      foundNext = true;
      // The preceding one is current
      if (i > 0) {
        prayerTimes[i - 1].isCurrent = true;
      }
    }
  }

  // If all prayers have passed today, tomorrow Fajr is next
  if (!foundNext) {
    // Current is Isha
    const ishaPt = prayerTimes.find(p => p.type === 'ISHA');
    if (ishaPt) ishaPt.isCurrent = true;
  }

  return prayerTimes;
}

export function getNextUpcomingPrayer(
  date: Date,
  options: CalculationOptions
): { nextPrayer: PrayerTime; secondsRemaining: number; progressPercent: number; prevPrayer: PrayerTime | null } {
  const nowMillis = Date.now();
  const todayPrayers = calculatePrayerTimes(date, options);

  const upcomingToday = todayPrayers.find(p => p.timestamp > nowMillis && p.type !== 'SUNRISE');

  if (upcomingToday) {
    const idx = todayPrayers.indexOf(upcomingToday);
    const prev = idx > 0 ? todayPrayers[idx - 1] : null;
    const totalSpan = prev ? (upcomingToday.timestamp - prev.timestamp) : 4 * 3600 * 1000;
    const elapsed = prev ? (nowMillis - prev.timestamp) : 0;
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
    const secondsRemaining = Math.max(0, Math.floor((upcomingToday.timestamp - nowMillis) / 1000));

    return {
      nextPrayer: { ...upcomingToday, isNext: true },
      secondsRemaining,
      progressPercent,
      prevPrayer: prev
    };
  }

  // Next is Tomorrow's Fajr
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrayers = calculatePrayerTimes(tomorrow, options);
  const tomorrowFajr = tomorrowPrayers.find(p => p.type === 'FAJR')!;

  const ishaToday = todayPrayers.find(p => p.type === 'ISHA');
  const prevTimestamp = ishaToday ? ishaToday.timestamp : nowMillis;
  const totalSpan = tomorrowFajr.timestamp - prevTimestamp;
  const elapsed = nowMillis - prevTimestamp;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
  const secondsRemaining = Math.max(0, Math.floor((tomorrowFajr.timestamp - nowMillis) / 1000));

  return {
    nextPrayer: { ...tomorrowFajr, isNext: true },
    secondsRemaining,
    progressPercent,
    prevPrayer: ishaToday || null
  };
}

/**
 * Calculates Qibla direction towards Holy Kaaba in Makkah (21.422487° N, 39.826206° E)
 * Returns azimuth angle in degrees [0, 360) clockwise from true North.
 */
export function calculateQiblaBearing(lat: number, lon: number): number {
  const kaabaLat = 21.422487;
  const kaabaLon = 39.826206;

  const φ1 = toRadians(lat);
  const φ2 = toRadians(kaabaLat);
  const Δλ = toRadians(kaabaLon - lon);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const qiblaRad = Math.atan2(y, x);
  let qiblaDeg = toDegrees(qiblaRad);
  qiblaDeg = (qiblaDeg + 360) % 360;

  return Math.round(qiblaDeg * 10) / 10;
}

/**
 * Great-circle distance to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(lat: number, lon: number): number {
  const R = 6371; // Earth radius in km
  const kaabaLat = 21.422487;
  const kaabaLon = 39.826206;

  const dLat = toRadians(kaabaLat - lat);
  const dLon = toRadians(kaabaLon - lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat)) * Math.cos(toRadians(kaabaLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Islamic Hijri Date calculation with adjustment days (+/- 2 days)
 */
export function getHijriDate(date: Date = new Date(), offsetDays: number = 0): {
  day: number;
  monthNameAr: string;
  year: number;
  formatted: string;
} {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + offsetDays);

  const hijriMonths = [
    'المحرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  // Try Intl format with islamic-umalqura
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(adjusted);
    let day = 1;
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10) || 1;
      if (part.type === 'month') month = parseInt(part.value, 10) || 1;
      if (part.type === 'year') year = parseInt(part.value, 10) || 1448;
    }

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthNameAr = hijriMonths[monthIndex];

    return {
      day,
      monthNameAr,
      year,
      formatted: `${day} ${monthNameAr} ${year} هـ`
    };
  } catch {
    // Fallback algorithmic Kuweit/Umm-Al-Qura
    const m = adjusted.getMonth() + 1;
    const y = adjusted.getFullYear();
    const d = adjusted.getDate();
    const jd = julianDate(y, m, d);
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;
    const monthIndex = Math.max(0, Math.min(11, month - 1));

    return {
      day,
      monthNameAr: hijriMonths[monthIndex],
      year,
      formatted: `${day} ${hijriMonths[monthIndex]} ${year} هـ`
    };
  }
}
