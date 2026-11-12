import {
  CityLocation,
  QuranSurahMeta,
  ZikrItem,
  ZikrCategory,
  PrayerSpiritualDetail,
  MissedReason,
  LegitimateExcuse,
  VoluntarySunnahItem,
  PrayerName
} from '../types';

export const CALCULATION_METHODS = [
  { id: 5, nameAr: 'الهيئة المصرية العامة للمساحة', descAr: 'الفجر: 19.5°، العشاء: 17.5° (مصر، إفريقيا، الشرق الأوسط)' },
  { id: 4, nameAr: 'أم القرى بمكة المكرمة', descAr: 'الفجر: 18.5°، العشاء: 90 دقيقة بعد المغرب (السعودية والخليج)' },
  { id: 1, nameAr: 'رابطة العالم الإسلامي', descAr: 'الفجر: 18.0°، العشاء: 17.0° (أوروبا وأمريكا ومعظم الدول)' },
  { id: 2, nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', descAr: 'الفجر: 15.0°، العشاء: 15.0°' },
  { id: 7, nameAr: 'معهد الجيوفيزياء بجامعة طهران', descAr: 'الفجر: 17.7°، العشاء: 14.0°' },
];

export const PREDEFINED_CITIES: CityLocation[] = [
  {
    "cityNameAr": "القاهرة",
    "cityNameEn": "Cairo",
    "countryNameAr": "مصر",
    "latitude": 30.0444,
    "longitude": 31.2357,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "ميت غمر",
    "cityNameEn": "Mit Ghamr",
    "countryNameAr": "مصر",
    "latitude": 30.7192,
    "longitude": 31.2625,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "قرية الربع (تمي الأمديد)",
    "cityNameEn": "Al-Roba' (Timay Al-Amdid)",
    "countryNameAr": "مصر",
    "latitude": 30.9167,
    "longitude": 31.5833,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "المنصورة",
    "cityNameEn": "Mansoura",
    "countryNameAr": "مصر",
    "latitude": 31.0409,
    "longitude": 31.3785,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "الإسكندرية",
    "cityNameEn": "Alexandria",
    "countryNameAr": "مصر",
    "latitude": 31.2001,
    "longitude": 29.9187,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "الجيزة",
    "cityNameEn": "Giza",
    "countryNameAr": "مصر",
    "latitude": 30.0131,
    "longitude": 31.2089,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "طنطا",
    "cityNameEn": "Tanta",
    "countryNameAr": "مصر",
    "latitude": 30.7865,
    "longitude": 31.0004,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "أسوان",
    "cityNameEn": "Aswan",
    "countryNameAr": "مصر",
    "latitude": 24.0889,
    "longitude": 32.8998,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "بورسعيد",
    "cityNameEn": "Port Said",
    "countryNameAr": "مصر",
    "latitude": 31.2653,
    "longitude": 32.3019,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "مكة المكرمة",
    "cityNameEn": "Makkah",
    "countryNameAr": "المملكة العربية السعودية",
    "latitude": 21.4225,
    "longitude": 39.8262,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "المدينة المنورة",
    "cityNameEn": "Madinah",
    "countryNameAr": "المملكة العربية السعودية",
    "latitude": 24.5247,
    "longitude": 39.5692,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "الرياض",
    "cityNameEn": "Riyadh",
    "countryNameAr": "المملكة العربية السعودية",
    "latitude": 24.7136,
    "longitude": 46.6753,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "جدة",
    "cityNameEn": "Jeddah",
    "countryNameAr": "المملكة العربية السعودية",
    "latitude": 21.5433,
    "longitude": 39.1728,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "الدمام",
    "cityNameEn": "Dammam",
    "countryNameAr": "المملكة العربية السعودية",
    "latitude": 26.4207,
    "longitude": 50.0888,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "دبي",
    "cityNameEn": "Dubai",
    "countryNameAr": "الإمارات العربية المتحدة",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "timezoneOffsetHours": 4.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "أبوظبي",
    "cityNameEn": "Abu Dhabi",
    "countryNameAr": "الإمارات العربية المتحدة",
    "latitude": 24.4539,
    "longitude": 54.3773,
    "timezoneOffsetHours": 4.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "الشارقة",
    "cityNameEn": "Sharjah",
    "countryNameAr": "الإمارات العربية المتحدة",
    "latitude": 25.3463,
    "longitude": 55.4209,
    "timezoneOffsetHours": 4.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "عَمّان",
    "cityNameEn": "Amman",
    "countryNameAr": "الأردن",
    "latitude": 31.9522,
    "longitude": 35.2332,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "القدس الشريف",
    "cityNameEn": "Jerusalem",
    "countryNameAr": "فلسطين",
    "latitude": 31.7683,
    "longitude": 35.2137,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "غزة",
    "cityNameEn": "Gaza",
    "countryNameAr": "فلسطين",
    "latitude": 31.5017,
    "longitude": 34.4668,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "الكويت",
    "cityNameEn": "Kuwait City",
    "countryNameAr": "الكويت",
    "latitude": 29.3759,
    "longitude": 47.9774,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "الدوحة",
    "cityNameEn": "Doha",
    "countryNameAr": "قطر",
    "latitude": 25.2854,
    "longitude": 51.531,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "المنامة",
    "cityNameEn": "Manama",
    "countryNameAr": "البحرين",
    "latitude": 26.2285,
    "longitude": 50.586,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "مسقط",
    "cityNameEn": "Muscat",
    "countryNameAr": "عُمان",
    "latitude": 23.588,
    "longitude": 58.3829,
    "timezoneOffsetHours": 4.0,
    "defaultMethod": 4
  },
  {
    "cityNameAr": "الرباط",
    "cityNameEn": "Rabat",
    "countryNameAr": "المغرب",
    "latitude": 34.0209,
    "longitude": -6.8416,
    "timezoneOffsetHours": 1.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "الدار البيضاء",
    "cityNameEn": "Casablanca",
    "countryNameAr": "المغرب",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "timezoneOffsetHours": 1.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "الجزائر",
    "cityNameEn": "Algiers",
    "countryNameAr": "الجزائر",
    "latitude": 36.7538,
    "longitude": 3.0588,
    "timezoneOffsetHours": 1.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "تونس",
    "cityNameEn": "Tunis",
    "countryNameAr": "تونس",
    "latitude": 36.8065,
    "longitude": 10.1815,
    "timezoneOffsetHours": 1.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "طرابلس",
    "cityNameEn": "Tripoli",
    "countryNameAr": "ليبيا",
    "latitude": 32.8872,
    "longitude": 13.1913,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "الخرطوم",
    "cityNameEn": "Khartoum",
    "countryNameAr": "السودان",
    "latitude": 15.5007,
    "longitude": 32.5599,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 5
  },
  {
    "cityNameAr": "بيروت",
    "cityNameEn": "Beirut",
    "countryNameAr": "لبنان",
    "latitude": 33.8938,
    "longitude": 35.5018,
    "timezoneOffsetHours": 2.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "دمشق",
    "cityNameEn": "Damascus",
    "countryNameAr": "سوريا",
    "latitude": 33.5138,
    "longitude": 36.2765,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "بغداد",
    "cityNameEn": "Baghdad",
    "countryNameAr": "العراق",
    "latitude": 33.3152,
    "longitude": 44.3661,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "إسطنبول",
    "cityNameEn": "Istanbul",
    "countryNameAr": "تركيا",
    "latitude": 41.0082,
    "longitude": 28.9784,
    "timezoneOffsetHours": 3.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "لندن",
    "cityNameEn": "London",
    "countryNameAr": "بريطانيا",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "timezoneOffsetHours": 0.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "باريس",
    "cityNameEn": "Paris",
    "countryNameAr": "فرنسا",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timezoneOffsetHours": 1.0,
    "defaultMethod": 1
  },
  {
    "cityNameAr": "نيويورك",
    "cityNameEn": "New York",
    "countryNameAr": "الولايات المتحدة",
    "latitude": 40.7128,
    "longitude": -74.006,
    "timezoneOffsetHours": -5.0,
    "defaultMethod": 2
  }
];

export const ALL_SURAHS: QuranSurahMeta[] = [
  {
    "number": 1,
    "nameAr": "الفَاتِحَة",
    "nameEn": "Al-Fatihah",
    "type": "مكية",
    "versesCount": 7,
    "startPage": 1
  },
  {
    "number": 2,
    "nameAr": "البَقَرَة",
    "nameEn": "Al-Baqarah",
    "type": "مدنية",
    "versesCount": 286,
    "startPage": 2
  },
  {
    "number": 3,
    "nameAr": "آل عِمْرَان",
    "nameEn": "Ali 'Imran",
    "type": "مدنية",
    "versesCount": 200,
    "startPage": 50
  },
  {
    "number": 4,
    "nameAr": "النِّسَاء",
    "nameEn": "An-Nisa",
    "type": "مدنية",
    "versesCount": 176,
    "startPage": 77
  },
  {
    "number": 5,
    "nameAr": "المَائِدَة",
    "nameEn": "Al-Ma'idah",
    "type": "مدنية",
    "versesCount": 120,
    "startPage": 106
  },
  {
    "number": 6,
    "nameAr": "الأَنْعَام",
    "nameEn": "Al-An'am",
    "type": "مكية",
    "versesCount": 165,
    "startPage": 128
  },
  {
    "number": 7,
    "nameAr": "الأَعْرَاف",
    "nameEn": "Al-A'raf",
    "type": "مكية",
    "versesCount": 206,
    "startPage": 151
  },
  {
    "number": 8,
    "nameAr": "الأَنْفَال",
    "nameEn": "Al-Anfal",
    "type": "مدنية",
    "versesCount": 75,
    "startPage": 177
  },
  {
    "number": 9,
    "nameAr": "التَّوْبَة",
    "nameEn": "At-Tawbah",
    "type": "مدنية",
    "versesCount": 129,
    "startPage": 187
  },
  {
    "number": 10,
    "nameAr": "يُونُس",
    "nameEn": "Yunus",
    "type": "مكية",
    "versesCount": 109,
    "startPage": 208
  },
  {
    "number": 11,
    "nameAr": "هُود",
    "nameEn": "Hud",
    "type": "مكية",
    "versesCount": 123,
    "startPage": 221
  },
  {
    "number": 12,
    "nameAr": "يُوسُف",
    "nameEn": "Yusuf",
    "type": "مكية",
    "versesCount": 111,
    "startPage": 235
  },
  {
    "number": 13,
    "nameAr": "الرَّعْد",
    "nameEn": "Ar-Ra'd",
    "type": "مدنية",
    "versesCount": 43,
    "startPage": 249
  },
  {
    "number": 14,
    "nameAr": "إِبْرَاهِيم",
    "nameEn": "Ibrahim",
    "type": "مكية",
    "versesCount": 52,
    "startPage": 255
  },
  {
    "number": 15,
    "nameAr": "الحِجْر",
    "nameEn": "Al-Hijr",
    "type": "مكية",
    "versesCount": 99,
    "startPage": 262
  },
  {
    "number": 16,
    "nameAr": "النَّحْل",
    "nameEn": "An-Nahl",
    "type": "مكية",
    "versesCount": 128,
    "startPage": 267
  },
  {
    "number": 17,
    "nameAr": "الإِسْرَاء",
    "nameEn": "Al-Isra",
    "type": "مكية",
    "versesCount": 111,
    "startPage": 282
  },
  {
    "number": 18,
    "nameAr": "الكَهْف",
    "nameEn": "Al-Kahf",
    "type": "مكية",
    "versesCount": 110,
    "startPage": 293
  },
  {
    "number": 19,
    "nameAr": "مَرْيَم",
    "nameEn": "Maryam",
    "type": "مكية",
    "versesCount": 98,
    "startPage": 305
  },
  {
    "number": 20,
    "nameAr": "طه",
    "nameEn": "Taha",
    "type": "مكية",
    "versesCount": 135,
    "startPage": 312
  },
  {
    "number": 21,
    "nameAr": "الأَنْبِيَاء",
    "nameEn": "Al-Anbiya",
    "type": "مكية",
    "versesCount": 112,
    "startPage": 322
  },
  {
    "number": 22,
    "nameAr": "الحَجّ",
    "nameEn": "Al-Hajj",
    "type": "مدنية",
    "versesCount": 78,
    "startPage": 332
  },
  {
    "number": 23,
    "nameAr": "المُؤْمِنُون",
    "nameEn": "Al-Mu'minun",
    "type": "مكية",
    "versesCount": 118,
    "startPage": 342
  },
  {
    "number": 24,
    "nameAr": "النُّور",
    "nameEn": "An-Nur",
    "type": "مدنية",
    "versesCount": 64,
    "startPage": 350
  },
  {
    "number": 25,
    "nameAr": "الفُرْقَان",
    "nameEn": "Al-Furqan",
    "type": "مكية",
    "versesCount": 77,
    "startPage": 359
  },
  {
    "number": 26,
    "nameAr": "الشُّعَرَاء",
    "nameEn": "Ash-Shu'ara",
    "type": "مكية",
    "versesCount": 227,
    "startPage": 367
  },
  {
    "number": 27,
    "nameAr": "النَّمْل",
    "nameEn": "An-Naml",
    "type": "مكية",
    "versesCount": 93,
    "startPage": 377
  },
  {
    "number": 28,
    "nameAr": "القَصَص",
    "nameEn": "Al-Qasas",
    "type": "مكية",
    "versesCount": 88,
    "startPage": 385
  },
  {
    "number": 29,
    "nameAr": "العَنْكَبُوت",
    "nameEn": "Al-'Ankabut",
    "type": "مكية",
    "versesCount": 69,
    "startPage": 396
  },
  {
    "number": 30,
    "nameAr": "الرُّوم",
    "nameEn": "Ar-Rum",
    "type": "مكية",
    "versesCount": 60,
    "startPage": 404
  },
  {
    "number": 31,
    "nameAr": "لُقْمَان",
    "nameEn": "Luqman",
    "type": "مكية",
    "versesCount": 34,
    "startPage": 411
  },
  {
    "number": 32,
    "nameAr": "السَّجْدَة",
    "nameEn": "As-Sajdah",
    "type": "مكية",
    "versesCount": 30,
    "startPage": 415
  },
  {
    "number": 33,
    "nameAr": "الأَحْزَاب",
    "nameEn": "Al-Ahzab",
    "type": "مدنية",
    "versesCount": 73,
    "startPage": 418
  },
  {
    "number": 34,
    "nameAr": "سَبَأ",
    "nameEn": "Saba",
    "type": "مكية",
    "versesCount": 54,
    "startPage": 428
  },
  {
    "number": 35,
    "nameAr": "فَاطِر",
    "nameEn": "Fatir",
    "type": "مكية",
    "versesCount": 45,
    "startPage": 434
  },
  {
    "number": 36,
    "nameAr": "يس",
    "nameEn": "Ya-Sin",
    "type": "مكية",
    "versesCount": 83,
    "startPage": 440
  },
  {
    "number": 37,
    "nameAr": "الصَّافَّات",
    "nameEn": "As-Saffat",
    "type": "مكية",
    "versesCount": 182,
    "startPage": 446
  },
  {
    "number": 38,
    "nameAr": "ص",
    "nameEn": "Sad",
    "type": "مكية",
    "versesCount": 88,
    "startPage": 453
  },
  {
    "number": 39,
    "nameAr": "الزُّمَر",
    "nameEn": "Az-Zumar",
    "type": "مكية",
    "versesCount": 75,
    "startPage": 458
  },
  {
    "number": 40,
    "nameAr": "غَافِر",
    "nameEn": "Ghafir",
    "type": "مكية",
    "versesCount": 85,
    "startPage": 467
  },
  {
    "number": 41,
    "nameAr": "فُصِّلَت",
    "nameEn": "Fussilat",
    "type": "مكية",
    "versesCount": 54,
    "startPage": 477
  },
  {
    "number": 42,
    "nameAr": "الشُّورَى",
    "nameEn": "Ash-Shura",
    "type": "مكية",
    "versesCount": 53,
    "startPage": 483
  },
  {
    "number": 43,
    "nameAr": "الزُّخْرُف",
    "nameEn": "Az-Zukhruf",
    "type": "مكية",
    "versesCount": 89,
    "startPage": 489
  },
  {
    "number": 44,
    "nameAr": "الدُّخَان",
    "nameEn": "Ad-Dukhan",
    "type": "مكية",
    "versesCount": 59,
    "startPage": 496
  },
  {
    "number": 45,
    "nameAr": "الجَاثِيَة",
    "nameEn": "Al-Jathiyah",
    "type": "مكية",
    "versesCount": 37,
    "startPage": 499
  },
  {
    "number": 46,
    "nameAr": "الأَحْقَاف",
    "nameEn": "Al-Ahqaf",
    "type": "مكية",
    "versesCount": 35,
    "startPage": 502
  },
  {
    "number": 47,
    "nameAr": "مُحَمَّد",
    "nameEn": "Muhammad",
    "type": "مدنية",
    "versesCount": 38,
    "startPage": 507
  },
  {
    "number": 48,
    "nameAr": "الفَتْح",
    "nameEn": "Al-Fath",
    "type": "مدنية",
    "versesCount": 29,
    "startPage": 511
  },
  {
    "number": 49,
    "nameAr": "الحُجُرَات",
    "nameEn": "Al-Hujurat",
    "type": "مدنية",
    "versesCount": 18,
    "startPage": 515
  },
  {
    "number": 50,
    "nameAr": "ق",
    "nameEn": "Qaf",
    "type": "مكية",
    "versesCount": 45,
    "startPage": 518
  },
  {
    "number": 51,
    "nameAr": "الذَّارِيَات",
    "nameEn": "Adh-Dhariyat",
    "type": "مكية",
    "versesCount": 60,
    "startPage": 520
  },
  {
    "number": 52,
    "nameAr": "الطُّور",
    "nameEn": "At-Tur",
    "type": "مكية",
    "versesCount": 49,
    "startPage": 523
  },
  {
    "number": 53,
    "nameAr": "النَّجْم",
    "nameEn": "An-Najm",
    "type": "مكية",
    "versesCount": 62,
    "startPage": 526
  },
  {
    "number": 54,
    "nameAr": "القَمَر",
    "nameEn": "Al-Qamar",
    "type": "مكية",
    "versesCount": 55,
    "startPage": 528
  },
  {
    "number": 55,
    "nameAr": "الرَّحْمَٰن",
    "nameEn": "Ar-Rahman",
    "type": "مدنية",
    "versesCount": 78,
    "startPage": 531
  },
  {
    "number": 56,
    "nameAr": "الوَاقِعَة",
    "nameEn": "Al-Waqi'ah",
    "type": "مكية",
    "versesCount": 96,
    "startPage": 534
  },
  {
    "number": 57,
    "nameAr": "الحَدِيد",
    "nameEn": "Al-Hadid",
    "type": "مدنية",
    "versesCount": 29,
    "startPage": 537
  },
  {
    "number": 58,
    "nameAr": "المُجَادِلَة",
    "nameEn": "Al-Mujadilah",
    "type": "مدنية",
    "versesCount": 22,
    "startPage": 542
  },
  {
    "number": 59,
    "nameAr": "الحَشْر",
    "nameEn": "Al-Hashr",
    "type": "مدنية",
    "versesCount": 24,
    "startPage": 545
  },
  {
    "number": 60,
    "nameAr": "المُمْتَحَنَة",
    "nameEn": "Al-Mumtahanah",
    "type": "مدنية",
    "versesCount": 13,
    "startPage": 549
  },
  {
    "number": 61,
    "nameAr": "الصَّفّ",
    "nameEn": "As-Saff",
    "type": "مدنية",
    "versesCount": 14,
    "startPage": 551
  },
  {
    "number": 62,
    "nameAr": "الجُمُعَة",
    "nameEn": "Al-Jumu'ah",
    "type": "مدنية",
    "versesCount": 11,
    "startPage": 553
  },
  {
    "number": 63,
    "nameAr": "المُنَافِقُون",
    "nameEn": "Al-Munafiqun",
    "type": "مدنية",
    "versesCount": 11,
    "startPage": 554
  },
  {
    "number": 64,
    "nameAr": "التَّغَابُن",
    "nameEn": "At-Taghabun",
    "type": "مدنية",
    "versesCount": 18,
    "startPage": 556
  },
  {
    "number": 65,
    "nameAr": "الطَّلَاق",
    "nameEn": "At-Talaq",
    "type": "مدنية",
    "versesCount": 12,
    "startPage": 558
  },
  {
    "number": 66,
    "nameAr": "التَّحْرِيم",
    "nameEn": "At-Tahrim",
    "type": "مدنية",
    "versesCount": 12,
    "startPage": 560
  },
  {
    "number": 67,
    "nameAr": "المُلْك",
    "nameEn": "Al-Mulk",
    "type": "مكية",
    "versesCount": 30,
    "startPage": 562
  },
  {
    "number": 68,
    "nameAr": "القَلَم",
    "nameEn": "Al-Qalam",
    "type": "مكية",
    "versesCount": 52,
    "startPage": 564
  },
  {
    "number": 69,
    "nameAr": "الحَاقَّة",
    "nameEn": "Al-Haqqah",
    "type": "مكية",
    "versesCount": 52,
    "startPage": 566
  },
  {
    "number": 70,
    "nameAr": "المَعَارِج",
    "nameEn": "Al-Ma'arij",
    "type": "مكية",
    "versesCount": 44,
    "startPage": 568
  },
  {
    "number": 71,
    "nameAr": "نُوح",
    "nameEn": "Nuh",
    "type": "مكية",
    "versesCount": 28,
    "startPage": 570
  },
  {
    "number": 72,
    "nameAr": "الجِنّ",
    "nameEn": "Al-Jinn",
    "type": "مكية",
    "versesCount": 28,
    "startPage": 572
  },
  {
    "number": 73,
    "nameAr": "المُزَّمِّل",
    "nameEn": "Al-Muzzammil",
    "type": "مكية",
    "versesCount": 20,
    "startPage": 574
  },
  {
    "number": 74,
    "nameAr": "المُدَّثِّر",
    "nameEn": "Al-Muddaththir",
    "type": "مكية",
    "versesCount": 56,
    "startPage": 575
  },
  {
    "number": 75,
    "nameAr": "القِيَامَة",
    "nameEn": "Al-Qiyamah",
    "type": "مكية",
    "versesCount": 40,
    "startPage": 577
  },
  {
    "number": 76,
    "nameAr": "الإِنْسَان",
    "nameEn": "Al-Insan",
    "type": "مدنية",
    "versesCount": 31,
    "startPage": 578
  },
  {
    "number": 77,
    "nameAr": "المُرْسَلَات",
    "nameEn": "Al-Mursalat",
    "type": "مكية",
    "versesCount": 50,
    "startPage": 580
  },
  {
    "number": 78,
    "nameAr": "النَّبَأ",
    "nameEn": "An-Naba",
    "type": "مكية",
    "versesCount": 40,
    "startPage": 582
  },
  {
    "number": 79,
    "nameAr": "النَّازِعَات",
    "nameEn": "An-Nazi'at",
    "type": "مكية",
    "versesCount": 46,
    "startPage": 583
  },
  {
    "number": 80,
    "nameAr": "عَبَسَ",
    "nameEn": "'Abasa",
    "type": "مكية",
    "versesCount": 42,
    "startPage": 585
  },
  {
    "number": 81,
    "nameAr": "التَّكْوِير",
    "nameEn": "At-Takwir",
    "type": "مكية",
    "versesCount": 29,
    "startPage": 586
  },
  {
    "number": 82,
    "nameAr": "الانْفِطَار",
    "nameEn": "Al-Infitar",
    "type": "مكية",
    "versesCount": 19,
    "startPage": 587
  },
  {
    "number": 83,
    "nameAr": "المُطَفِّفِين",
    "nameEn": "Al-Mutaffifin",
    "type": "مكية",
    "versesCount": 36,
    "startPage": 587
  },
  {
    "number": 84,
    "nameAr": "الانْشِقَاق",
    "nameEn": "Al-Inshiqaq",
    "type": "مكية",
    "versesCount": 25,
    "startPage": 589
  },
  {
    "number": 85,
    "nameAr": "البُرُوج",
    "nameEn": "Al-Buruj",
    "type": "مكية",
    "versesCount": 22,
    "startPage": 590
  },
  {
    "number": 86,
    "nameAr": "الطَّارِق",
    "nameEn": "At-Tariq",
    "type": "مكية",
    "versesCount": 17,
    "startPage": 591
  },
  {
    "number": 87,
    "nameAr": "الأَعْلَى",
    "nameEn": "Al-A'la",
    "type": "مكية",
    "versesCount": 19,
    "startPage": 591
  },
  {
    "number": 88,
    "nameAr": "الغَاشِيَة",
    "nameEn": "Al-Ghashiyah",
    "type": "مكية",
    "versesCount": 26,
    "startPage": 592
  },
  {
    "number": 89,
    "nameAr": "الفَجْر",
    "nameEn": "Al-Fajr",
    "type": "مكية",
    "versesCount": 30,
    "startPage": 593
  },
  {
    "number": 90,
    "nameAr": "البَلَد",
    "nameEn": "Al-Balad",
    "type": "مكية",
    "versesCount": 20,
    "startPage": 594
  },
  {
    "number": 91,
    "nameAr": "الشَّمْس",
    "nameEn": "Ash-Shams",
    "type": "مكية",
    "versesCount": 15,
    "startPage": 595
  },
  {
    "number": 92,
    "nameAr": "اللَّيْل",
    "nameEn": "Al-Layl",
    "type": "مكية",
    "versesCount": 21,
    "startPage": 595
  },
  {
    "number": 93,
    "nameAr": "الضُّحَى",
    "nameEn": "Ad-Duha",
    "type": "مكية",
    "versesCount": 11,
    "startPage": 596
  },
  {
    "number": 94,
    "nameAr": "الشَّرْح",
    "nameEn": "Ash-Sharh",
    "type": "مكية",
    "versesCount": 8,
    "startPage": 596
  },
  {
    "number": 95,
    "nameAr": "التِّين",
    "nameEn": "At-Tin",
    "type": "مكية",
    "versesCount": 8,
    "startPage": 597
  },
  {
    "number": 96,
    "nameAr": "العَلَق",
    "nameEn": "Al-'Alaq",
    "type": "مكية",
    "versesCount": 19,
    "startPage": 597
  },
  {
    "number": 97,
    "nameAr": "القَدْر",
    "nameEn": "Al-Qadr",
    "type": "مكية",
    "versesCount": 5,
    "startPage": 598
  },
  {
    "number": 98,
    "nameAr": "البَيِّنَة",
    "nameEn": "Al-Bayyinah",
    "type": "مدنية",
    "versesCount": 8,
    "startPage": 598
  },
  {
    "number": 99,
    "nameAr": "الزَّلْزَلَة",
    "nameEn": "Az-Zalzalah",
    "type": "مدنية",
    "versesCount": 8,
    "startPage": 599
  },
  {
    "number": 100,
    "nameAr": "العَادِيَات",
    "nameEn": "Al-'Adiyat",
    "type": "مكية",
    "versesCount": 11,
    "startPage": 599
  },
  {
    "number": 101,
    "nameAr": "القَارِعَة",
    "nameEn": "Al-Qari'ah",
    "type": "مكية",
    "versesCount": 11,
    "startPage": 600
  },
  {
    "number": 102,
    "nameAr": "التَّكَاثُر",
    "nameEn": "At-Takathur",
    "type": "مكية",
    "versesCount": 8,
    "startPage": 600
  },
  {
    "number": 103,
    "nameAr": "العَصْر",
    "nameEn": "Al-'Asr",
    "type": "مكية",
    "versesCount": 3,
    "startPage": 601
  },
  {
    "number": 104,
    "nameAr": "الهُمَزَة",
    "nameEn": "Al-Humazah",
    "type": "مكية",
    "versesCount": 9,
    "startPage": 601
  },
  {
    "number": 105,
    "nameAr": "الفِيل",
    "nameEn": "Al-Fil",
    "type": "مكية",
    "versesCount": 5,
    "startPage": 601
  },
  {
    "number": 106,
    "nameAr": "قُرَيْش",
    "nameEn": "Quraysh",
    "type": "مكية",
    "versesCount": 4,
    "startPage": 602
  },
  {
    "number": 107,
    "nameAr": "المَاعُون",
    "nameEn": "Al-Ma'un",
    "type": "مكية",
    "versesCount": 7,
    "startPage": 602
  },
  {
    "number": 108,
    "nameAr": "الكَوْثَر",
    "nameEn": "Al-Kawthar",
    "type": "مكية",
    "versesCount": 3,
    "startPage": 602
  },
  {
    "number": 109,
    "nameAr": "الكَافِرُون",
    "nameEn": "Al-Kafirun",
    "type": "مكية",
    "versesCount": 6,
    "startPage": 603
  },
  {
    "number": 110,
    "nameAr": "النَّصْر",
    "nameEn": "An-Nasr",
    "type": "مدنية",
    "versesCount": 3,
    "startPage": 603
  },
  {
    "number": 111,
    "nameAr": "المَسَد",
    "nameEn": "Al-Masad",
    "type": "مكية",
    "versesCount": 5,
    "startPage": 603
  },
  {
    "number": 112,
    "nameAr": "الإِخْلَاص",
    "nameEn": "Al-Ikhlas",
    "type": "مكية",
    "versesCount": 4,
    "startPage": 604
  },
  {
    "number": 113,
    "nameAr": "الفَلَق",
    "nameEn": "Al-Falaq",
    "type": "مكية",
    "versesCount": 5,
    "startPage": 604
  },
  {
    "number": 114,
    "nameAr": "النَّاس",
    "nameEn": "An-Nas",
    "type": "مكية",
    "versesCount": 6,
    "startPage": 604
  }
];

export const AZKAR_CATEGORIES: ZikrCategory[] = [
  { id: 'morning', title: 'أذكار الصباح', icon: '🌅', description: 'من طلوع الفجر وحتى الشروق لحفظ النفس والبركة ونور اليوم' },
  { id: 'evening', title: 'أذكار المساء', icon: '🌇', description: 'من بعد صلاة العصر وحتى الغروب لحصن المسلم والسكينة والوقاية' },
  { id: 'sleep', title: 'أذكار النوم', icon: '🌙', description: 'قبل النوم مباشرة مع النفث وسور الحفظ والسكينة وطهارة الروح' },
  { id: 'after_prayer', title: 'أذكار بعد الصلاة', icon: '🕌', description: 'المسنونة عقب التسليم من كل فريضة مباشرة لنيل المغفرة' },
  { id: 'tasbeeh', title: 'مسبحة حق الله', icon: '📿', description: 'عداد التسبيح والاستغفار المفتوح مع الاهتزاز والذكر المضاعف' }
];

export const INITIAL_AZKAR: ZikrItem[] = [
  {
    "id": 1,
    "text": "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قرأها حين يصبح أُجير من الجن حتى يمسي",
    "source": "صحيح الترغيب والترهيب",
    "category": "morning"
  },
  {
    "id": 2,
    "text": "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "من قالها ثلاثاً حين يصبح وحين يمسي كفته من كل شيء",
    "source": "أبو داود والترمذي",
    "category": "morning"
  },
  {
    "id": 3,
    "text": "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "سيد الاستغفار: من قاله موقناً به فمات من يومه قبل أن يمسي دخل الجنة",
    "source": "صحيح البخاري",
    "category": "morning"
  },
  {
    "id": 4,
    "text": "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "سؤال الخير والاستعاذة من الشر والكسل وعذاب القبر",
    "source": "صحيح مسلم",
    "category": "morning"
  },
  {
    "id": 5,
    "text": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الحَمْدُ وَلَكَ الشُّكْرُ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قالها حين يصبح فقد أدى شكر يومه",
    "source": "أبو داود والنسائي",
    "category": "morning"
  },
  {
    "id": 6,
    "text": "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "كان حقاً على الله أن يرضيه يوم القيامة",
    "source": "مسند أحمد وصحيح أبي داود",
    "category": "morning"
  },
  {
    "id": 7,
    "text": "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ.",
    "targetCount": 7,
    "currentCount": 0,
    "virtue": "من قالها سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة",
    "source": "أبو داود",
    "category": "morning"
  },
  {
    "id": 8,
    "text": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "دعاء النبي ﷺ لفاطمة رضي الله عنها كل صباح ومساء",
    "source": "صحيح الحاكم والنسائي",
    "category": "morning"
  },
  {
    "id": 9,
    "text": "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "من قالها ثلاثاً لم يضره شيء حتى يمسي",
    "source": "الترمذي وابن ماجه",
    "category": "morning"
  },
  {
    "id": 10,
    "text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "تعدل ساعات طويلة من الذكر والتسبيح",
    "source": "صحيح مسلم",
    "category": "morning"
  },
  {
    "id": 11,
    "text": "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "تجديد العهد مع التوحيد وسنة الحنيفية السمحة",
    "source": "مسند أحمد",
    "category": "morning"
  },
  {
    "id": 20,
    "text": "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾ [سورة البقرة: 255]",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قرأها حين يمسي أُجير من الجن حتى يصبح",
    "source": "صحيح الترغيب والترهيب",
    "category": "evening"
  },
  {
    "id": 21,
    "text": "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "تكفيك من كل شر وحسد وأذى تلك الليلة (تقرأ 3 مرات)",
    "source": "الترمذي وأبو داود",
    "category": "evening"
  },
  {
    "id": 22,
    "text": "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "سيد الاستغفار: من قاله موقناً به فمات من ليلته دخل الجنة",
    "source": "صحيح البخاري",
    "category": "evening"
  },
  {
    "id": 23,
    "text": "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "طلب خير الليل والاستعاذة من شره وفتنة القبر",
    "source": "صحيح مسلم",
    "category": "evening"
  },
  {
    "id": 24,
    "text": "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الحَمْدُ وَلَكَ الشُّكْرُ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قالها حين يمسي فقد أدى شكر ليلته",
    "source": "أبو داود",
    "category": "evening"
  },
  {
    "id": 25,
    "text": "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "إقرار بالحياة والموت والرجوع إلى الله سبحانه",
    "source": "الترمذي",
    "category": "evening"
  },
  {
    "id": 26,
    "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "من قالها ثلاثاً لم يضره حُمَة أو لدغة ولا شر في تلك الليلة",
    "source": "صحيح مسلم",
    "category": "evening"
  },
  {
    "id": 27,
    "text": "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "كان حقاً على الله أن يرضيه يوم القيامة",
    "source": "مسند أحمد",
    "category": "evening"
  },
  {
    "id": 28,
    "text": "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ.",
    "targetCount": 7,
    "currentCount": 0,
    "virtue": "كفاه الله ما أهمه من أمر الدنيا والآخرة",
    "source": "أبو داود",
    "category": "evening"
  },
  {
    "id": 29,
    "text": "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "من قالها ثلاثاً لم تصبه فجأة بلاء حتى يصبح",
    "source": "أبو داود",
    "category": "evening"
  },
  {
    "id": 30,
    "text": "﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾ [سورة البقرة: 285-286]",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه من كل سوء وشر ومكروه",
    "source": "صحيح البخاري وصحيح مسلم",
    "category": "evening"
  },
  {
    "id": 31,
    "text": "اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "دعاء الحفظ الشامل في الدين والدنيا من كل الجهات الست لم يكن النبي ﷺ يدعه",
    "source": "سنن أبي داود وابن ماجه وصححه الألباني",
    "category": "evening"
  },
  {
    "id": 32,
    "text": "اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "استعاذة جامعة من شر النفس والشيطان والظلم",
    "source": "جامع الترمذي وصحيح أبي داود",
    "category": "evening"
  },
  {
    "id": 33,
    "text": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "دعاء النبي ﷺ لفاطمة رضي الله عنها كل صباح ومساء",
    "source": "صحيح الحاكم والنسائي",
    "category": "evening"
  },
  {
    "id": 34,
    "text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "حُطّت خطاياه وإن كانت مثل زبد البحر ولم يأتِ أحد يوم القيامة بأفضل مما جاء به",
    "source": "صحيح مسلم",
    "category": "evening"
  },
  {
    "id": 35,
    "text": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    "targetCount": 10,
    "currentCount": 0,
    "virtue": "كانت له عدل أربع رقاب من ولد إسماعيل وحفظ من الشيطان",
    "source": "صحيح مسلم",
    "category": "evening"
  },
  {
    "id": 40,
    "text": "«جمع الكفين والنفث فيهما وقراءة السور الكريمة كاملة:\\n\\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾\\n\\nثم يمسح بهما ما استطاع من جسده يبدأ برأسه ووجهه وما أقبل من جسده (يفعل ذلك 3 مرات)».",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "سنة النبي ﷺ كل ليلة لحفظ الجسد والروح من الشياطين والوسواس",
    "source": "صحيح البخاري",
    "category": "sleep"
  },
  {
    "id": 41,
    "text": "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾ [سورة البقرة: 255]",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قرأها إذا أوى إلى فراشه لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح",
    "source": "صحيح البخاري",
    "category": "sleep"
  },
  {
    "id": 42,
    "text": "﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾ [سورة البقرة: 285-286]",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه من كل سوء ومكروه",
    "source": "صحيح البخاري",
    "category": "sleep"
  },
  {
    "id": 43,
    "text": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "استيداع الروح لله والنوم في كنف حفظه ورعايته",
    "source": "متفق عليه",
    "category": "sleep"
  },
  {
    "id": 44,
    "text": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    "targetCount": 3,
    "currentCount": 0,
    "virtue": "كان رسول الله ﷺ إذا أراد أن يرقد وضع يده اليمنى تحت خده ثم قالها ثلاثاً",
    "source": "أبو داود والترمذي",
    "category": "sleep"
  },
  {
    "id": 45,
    "text": "سُبْحَانَ اللَّهِ",
    "targetCount": 33,
    "currentCount": 0,
    "virtue": "وصية النبي ﷺ لعلي وفاطمة رضي الله عنهما: خير من خادم وقوة للبدن",
    "source": "متفق عليه",
    "category": "sleep"
  },
  {
    "id": 46,
    "text": "الحَمْدُ لِلَّهِ",
    "targetCount": 33,
    "currentCount": 0,
    "virtue": "شكر على نعم اليوم والسلامة قبل النوم",
    "source": "متفق عليه",
    "category": "sleep"
  },
  {
    "id": 47,
    "text": "اللَّهُ أَكْبَرُ",
    "targetCount": 34,
    "currentCount": 0,
    "virtue": "إتمام المائة بالتكبير 34 مرة في أذكار النوم",
    "source": "متفق عليه",
    "category": "sleep"
  },
  {
    "id": 48,
    "text": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "من قالها ثم مات من ليلته مات على الفطرة",
    "source": "متفق عليه",
    "category": "sleep"
  },
  {
    "id": 60,
    "text": "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الجَلاَلِ وَالإِكْرَامِ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "سنة النبي ﷺ عقب التسليم من الفريضة مباشرة لجبر التقصير",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 61,
    "text": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الجَدِّ مِنْكَ الجَدُّ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "إقرار بتوحيد الربوبية والألوهية والتفويض المطلق لله",
    "source": "صحيح البخاري ومسلم",
    "category": "after_prayer"
  },
  {
    "id": 62,
    "text": "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَلاَ نَعْبُدُ إِلاَّ إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الفَضْلُ وَلَهُ الثَّنَاءُ الحَسَنُ، لاَ إِلَهَ إِلاَّ اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الكَافِرُونَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "كان ابن الزبير يهلل بهن دبر كل صلاة حين يسلم",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 63,
    "text": "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾ [سورة البقرة: 255]",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "«من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت»",
    "source": "رواه النسائي وابن حبان وصححه الألباني",
    "category": "after_prayer"
  },
  {
    "id": 64,
    "text": "سُبْحَانَ اللَّهِ",
    "targetCount": 33,
    "currentCount": 0,
    "virtue": "تسبيح الزهراء: غفران الذنوب وإن كانت مثل زبد البحر عند إتمام المائة",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 65,
    "text": "الحَمْدُ لِلَّهِ",
    "targetCount": 33,
    "currentCount": 0,
    "virtue": "تحميد الزهراء: تملأ الميزان بالخير والبركة",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 66,
    "text": "اللَّهُ أَكْبَرُ",
    "targetCount": 33,
    "currentCount": 0,
    "virtue": "تكبير الزهراء دبر كل صلاة مكتوبة",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 67,
    "text": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "تمام المائة بعد التسبيح والتحميد والتكبير",
    "source": "صحيح مسلم",
    "category": "after_prayer"
  },
  {
    "id": 68,
    "text": "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\\n\\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "أمرني رسول الله ﷺ أن أقرأ بالمعوذات دبر كل صلاة (وتقرأ 3 مرات بعد الفجر والمغرب)",
    "source": "أبو داود والترمذي",
    "category": "after_prayer"
  },
  {
    "id": 69,
    "text": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",
    "targetCount": 1,
    "currentCount": 0,
    "virtue": "وصية النبي ﷺ لمعاذ بن جبل رضي الله عنه دبر كل صلاة مكتوبة",
    "source": "سنن أبي داود والنسائي بإسناد صحيح",
    "category": "after_prayer"
  },
  {
    "id": 80,
    "text": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن",
    "source": "متفق عليه",
    "category": "tasbeeh"
  },
  {
    "id": 81,
    "text": "أَسْتَغْفِرُ اللَّهَ العَظِيمَ وَأَتُوبُ إِلَيْهِ",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "مفتاح تفريج الهموم والبركة في الرزق وقوة الأبدان",
    "source": "صحيح مسلم",
    "category": "tasbeeh"
  },
  {
    "id": 82,
    "text": "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "من صلى علي صلاة صلى الله عليه بها عشراً وحُطت عنه عشر خطيئات",
    "source": "صحيح الترمذي",
    "category": "tasbeeh"
  },
  {
    "id": 83,
    "text": "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ العَلِيِّ العَظِيمِ",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "كنز من كنوز العرش والجنة ودواء لتسعة وتسعين داء أيسرها الهم",
    "source": "متفق عليه",
    "category": "tasbeeh"
  },
  {
    "id": 84,
    "text": "سُبْحَانَ اللَّهِ وَالحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ",
    "targetCount": 100,
    "currentCount": 0,
    "virtue": "أحب الكلام إلى الله، وغراس الجنة، وأفضل ما طلعت عليه الشمس",
    "source": "صحيح مسلم",
    "category": "tasbeeh"
  }
];

export const SPIRITUAL_DATA: Partial<Record<PrayerName, PrayerSpiritualDetail>> = {
  "FAJR": {
    "prayerType": "FAJR",
    "quranVerse": "﴿أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا﴾",
    "quranSurah": "سورة الإسراء: 78",
    "hadith": "قال رسول الله ﷺ: «مَن صَلَّى البَرْدَيْنِ دَخَلَ الجَنَّةَ» (البردان: الفجر والعصر) [متفق عليه]",
    "spiritualTip": "صلاة الفجر هي عنوان الصدق مع الله وعهد النور في يومك، من صلى الفجر فهو في ذمة الله وأمانه وحفظه حتى يمسي.",
    "virtue": "تشهدها ملائكة الليل وملائكة النهار، وتمنحك طاقة ورضا ونشاطاً طوال اليوم."
  },
  "DHUHR": {
    "prayerType": "DHUHR",
    "quranVerse": "﴿فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ ۝ وَلَهُ الْحَمْدُ فِي السَّمَاوَاتِ وَالْأَرْضِ وَعَشِيًّا وَحِينَ تُظْهِرُونَ﴾",
    "quranSurah": "سورة الروم: 17-18",
    "hadith": "قال رسول الله ﷺ: «إنَّها ساعةٌ تُفْتَحُ فيها أبوابُ السَّماءِ، فأُحِبُّ أنْ يَصْعَدَ لي فيها عَمَلٌ صالِحٌ» [صحيح الترمذي]",
    "spiritualTip": "استراحة الصلاة وسط زحام الأعمال وضغوط النهار هي تطهير لقلبك وتجديد لنشاطك، فقف بين يدي ربك مستعيناً به على سائر يومك.",
    "virtue": "تفتح فيها أبواب السماء وتغفر بها الذنوب والخطايا بين الصلاتين."
  },
  "ASR": {
    "prayerType": "ASR",
    "quranVerse": "﴿حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ﴾",
    "quranSurah": "سورة البقرة: 238",
    "hadith": "قال رسول الله ﷺ: «مَن تَرَكَ صَلَاةَ العَصْرِ حَبِطَ عَمَلُهُ» [صحيح البخاري]",
    "spiritualTip": "الصلاة الوسطى هي اختبار الثبات في ذروة انشغال الناس بإنهاء أعمالهم، فلا تجعل الدنيا تسرق منك أعظم صلوات النهار.",
    "virtue": "الحفاظ عليها سبب مباشر للنجاة من النار ورؤية وجه الله الكريم في الجنة."
  },
  "MAGHRIB": {
    "prayerType": "MAGHRIB",
    "quranVerse": "﴿وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِّنَ اللَّيْلِ ۚ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ ۚ ذَٰلِكَ ذِكْرَىٰ لِلذَّاكِرِينَ﴾",
    "quranSurah": "سورة هود: 114",
    "hadith": "قال رسول الله ﷺ: «لا تزال أمتي بخير - أو على الفطرة - ما لم يؤخروا المغرب حتى تشتبك النجوم» [صحيح أبي داود]",
    "spiritualTip": "عند غروب الشمس وتوديع النهار، اقبل على ربك بقلب شاكر مستغفر يطمع في رحمته وعفوه عن تقصير اليوم.",
    "virtue": "وقت إجابة واستجابة للدعاء، وتذكير بانقضاء العمر وحسن الختام."
  },
  "ISHA": {
    "prayerType": "ISHA",
    "quranVerse": "﴿وَمِنَ اللَّيْلِ فَسَبِّحْهُ وَإِدْبَارَ النُّجُومِ﴾",
    "quranSurah": "سورة الطور: 49",
    "hadith": "قال رسول الله ﷺ: «مَن صَلَّى العِشاءَ في جَماعَةٍ فَكَأنَّما قامَ نِصْفَ اللَّيْلِ، ومَن صَلَّى الصُّبْحَ في جَماعَةٍ فَكَأنَّما صَلَّى اللَّيْلَ كُلَّهُ» [صحيح مسلم]",
    "spiritualTip": "اختم يومك بالوقوف بين يدي الله لتكون آخر أعمالك طاعة وسكينة، واستقبل نومك بطهارة وراحة ضمير.",
    "virtue": "براءة من النفاق وأجر قيام نصف الليل كله."
  }
};

export const MISSED_REASONS: MissedReason[] = [
  {
    id: 'laziness',
    title: 'الكسل والتسويف',
    iconEmoji: '🛌',
    guidanceTitle: 'الوضوء يفك كل العقد ويزرع النشاط والبركة',
    guidanceText: 'إن الشيطان يعقد على قافية رأس أحدكم ثلاث عقد إذا هو نام أو فتر، فإذا ذكرت الله انحلت عقدة، وإذا توضأت انحلت الثانية، وإذا صليت انحلت العقد كلها وأصبحت طيب النفس نشيطاً. 5 دقائق فقط تقف فيها بين يدي خالقك تعيد ترتيب روحك وتنزع ثقل الكسل.',
    scripture: 'قال ﷺ: «ركعتا الفجر خيرٌ من الدنيا وما فيها» [صحيح مسلم]',
    actionHint: 'قم فوراً وأسبغ الوضوء بماءٍ بارد، وسترى كيف يتبدد الكسل والهم بثوانٍ معدودة.'
  },
  {
    id: 'work_study',
    title: 'الانشغال بالعمل أو المذاكرة',
    iconEmoji: '💼',
    guidanceTitle: 'البركة والتوفيق والرزق بيد من تناديه وتناجيه',
    guidanceText: 'كيف نطلب التوفيق في دراستنا أو البركة في رزقنا ممن نعصيه بتأخير ندائه؟! الصلاة ليست مضيعة للوقت بل هي شاحن التركيز وإزالة التوتر وتجديد الدورة الدموية. من ترك شيئاً لله رزقه الله أضعافه توفيقاً وسداداً وراحة بال.',
    scripture: '﴿وَأْمُرْ أَهْلَكَ بِالصَّلَاةِ وَاصْطَبِرْ عَلَيْهَا ۖ لَا نَسْأَلُكَ رِزْقًا ۖ نَّحْنُ نَرْزُقُكَ ۗ وَالْعَاقِبَةُ لِلتَّقْوَىٰ﴾ [طه: 132]',
    actionHint: 'استأذن لدقائق معدودة لأداء فرضك، وسترى كيف تتضاعف إنتاجيتك وتتيسر أمورك بعدها.'
  },
  {
    id: 'forgetfulness',
    title: 'السهو أو النسيان العارض',
    iconEmoji: '💭',
    guidanceTitle: 'تذكرك الآن رزق وتنبيه كريم ورحمة من الله',
    guidanceText: 'النسيان طبع بشري عفى الله عنه، ولكن ما دمت قد انتبهت الآن فهذه رحمة ونعمة عظيمة لا ينبغي إضاعتها بالتأجيل. كفارة الصلاة المنسية هي المبادرة إليها فور تذكرها مباشرة.',
    scripture: 'قال رسول الله ﷺ: «مَن نَسِيَ صَلَاةً، فَلْيُصَلِّ إذَا ذَكَرَهَا، لا كَفَّارَةَ لَهَا إلَّا ذلكَ» [صحيح البخاري]',
    actionHint: 'لا تؤجل لحظة واحدة، ما تذكرته إلا لتقف بين يدي ربك وتغتنم هذه اللحظة المباركة.'
  },
  {
    id: 'travel_outside',
    title: 'في الطريق أو خارج المنزل',
    iconEmoji: '🚗',
    guidanceTitle: 'الأرض كلها مسجد وطهور ومكان للسجود',
    guidanceText: 'من عظمة الإسلام ويسره أنه جعل الأرض طاهرة أينما أدركتك الصلاة فصلِّ، في أقرب مصلى، في حديقة، أو مكان طاهر في العمل أو السفر. الصلاة عماد الدين وهي الصلة التي لا تنقطع في سفر ولا حضر.',
    scripture: 'قال ﷺ: «وجُعِلَتْ لي الأرضُ مَسْجِدًا وطَهُورًا، فأيّما رَجُلٍ مِن أُمَّتِي أدْرَكَتْهُ الصَّلاةُ فَلْيُصَلِّ» [متفق عليه]',
    actionHint: 'حدد اتجاه القبلة عبر البوصلة التفاعلية وصلِّ على سجادتك أو في أقرب مسجد أو مكان طاهر.'
  },
  {
    id: 'emergency',
    title: 'ظرف طارئ أو عذر شرعي',
    iconEmoji: '🩺',
    guidanceTitle: 'يريد الله بكم اليسر ولا يريد بكم العسر',
    guidanceText: 'الدين يسر ورحمة، وإذا كان هناك عذر شرعي معتبر أو إنقاذ لحياة أو ظرف قاهر فالقلب معلق بالله. اسأل الله القبول وثبات القلب على الطاعة والمسارعة دائماً.',
    scripture: '﴿لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا﴾ [البقرة: 286]',
    actionHint: 'إذا زال العذر أو انتهى الظرف بادر بقضاء ما فاتك بحب ورجاء وإخبات.'
  }
];

export const VOLUNTARY_SUNNAH_CATALOG: VoluntarySunnahItem[] = [
  {
    id: 'sunnah_fajr',
    titleAr: 'سنة الفجر القبلية',
    rakatsText: 'ركعتان قبل الفجر',
    virtueAr: 'قال رسول الله ﷺ: «رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا» [صحيح مسلم]',
    iconEmoji: '🌅'
  },
  {
    id: 'sunnah_dhuhr_before',
    titleAr: 'سنة الظهر القبلية',
    rakatsText: '4 ركعات قبل الظهر',
    virtueAr: 'من رواتب الصلوات المؤكدة التي تفتح لها أبواب السماء',
    iconEmoji: '☀️'
  },
  {
    id: 'sunnah_dhuhr_after',
    titleAr: 'سنة الظهر البعدية',
    rakatsText: 'ركعتان بعد الظهر',
    virtueAr: 'من حافظ على أربع قبل الظهر وركعتين بعدها بنى الله له بيتاً في الجنة',
    iconEmoji: '🌤️'
  },
  {
    id: 'sunnah_maghrib',
    titleAr: 'سنة المغرب البعدية',
    rakatsText: 'ركعتان بعد المغرب',
    virtueAr: 'سنة راتبة مؤكدة كان النبي ﷺ يحرص على أدائها في بيته',
    iconEmoji: '🌇'
  },
  {
    id: 'sunnah_isha',
    titleAr: 'سنة العشاء البعدية',
    rakatsText: 'ركعتان بعد العشاء',
    virtueAr: 'تختم رواتب صلوات اليوم المفروضة بمزيد من النور والأجر والرفعة',
    iconEmoji: '🌙'
  },
  {
    id: 'sunnah_duha',
    titleAr: 'صلاة الضحى',
    rakatsText: 'ركعتان إلى 8 ركعات',
    virtueAr: '«صلاة الأوّابين» وتجزئ عن صدقة 360 مفصلاً في جسد الإنسان كل يوم',
    iconEmoji: '🕊️'
  },
  {
    id: 'sunnah_witr_qiyam',
    titleAr: 'قيام الليل والوتر',
    rakatsText: 'ركعات قيام الليل + الوتر',
    virtueAr: '«أفضل الصلاة بعد المكتوبة قيام الليل» و«إن الله وتر يحب الوتر»',
    iconEmoji: '✨'
  }
];

export const ISLAMIC_EXCUSES: LegitimateExcuse[] = [
  {
    id: 'travel',
    titleAr: 'السفر (رخصة الجمع والقصر)',
    iconEmoji: '✈️',
    descriptionAr: 'السفر لمسافة تقارب 80 كم فأكثر يبيح قصر الصلاة الرباعية والجمع بين الظهر والعصر أو المغرب والعشاء.',
    fiqhRule: 'قال تعالى: ﴿وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَن تَقْصُرُوا مِنَ الصَّلَاةِ﴾ [النساء: 101]'
  },
  {
    id: 'sickness',
    titleAr: 'المرض أو المشقة الشديدة',
    iconEmoji: '🩺',
    descriptionAr: 'المريض يصلي حسب استطاعته قائماً أو جالساً أو مضطجعاً، وله الجمع بين الصلاتين عند المشقة.',
    fiqhRule: 'قال رسول الله ﷺ: «صَلِّ قَائِمًا، فإنْ لَمْ تَسْتَطِعْ فَقَاعِدًا، فإنْ لَمْ تَسْتَطِعْ فَعَلَى جَنْبٍ» [صحيح البخاري]'
  },
  {
    id: 'sleep_forgotten',
    titleAr: 'غلبه النوم أو النسيان دون تفريط',
    iconEmoji: '🛌',
    descriptionAr: 'من فاتته صلاة بنوم غير متعمد أو نسيان عارض، فكفارتها أن يصليها بمجرد انتباهه أو تذكره.',
    fiqhRule: 'قال ﷺ: «إنَّه ليسَ في النَّوْمِ تَفْرِيطٌ، إنَّما التَّفْرِيطُ علَى مَن لَمْ يُصَلِّ حتَّى يَجِيءَ وَقْتُ الصَّلَاةِ الأُخْرَى»'
  },
  {
    id: 'women_excuse',
    titleAr: 'عذر شرعي للنساء (حيض / نفاس)',
    iconEmoji: '🌸',
    descriptionAr: 'إسقاط شرعي تام للصلاة في هذه الفترة دون وجوب القضاء، رحمةً وتخفيفاً من الله عز وجل.',
    fiqhRule: 'ثبت بالسنة النبوية وإجماع العلماء أن الحائض والنفساء تدع الصلاة ولا تقضيها.'
  },
  {
    id: 'emergency_duty',
    titleAr: 'عمل قهري أو إنقاذ روح طارئ',
    iconEmoji: '🚨',
    descriptionAr: 'كالطبيب المنشغل بعملية جراحية حرجة أو رجل الإطفاء أو ظرف أمني حرج يخشى فوات النفس فيه.',
    fiqhRule: 'القاعدة الفقهية: «الضَّرُورَاتُ تُبِيحُ الْمَحْظُورَاتِ»، ويصليها الشخص فور انتهاء حالة الطوارئ.'
  }
];
