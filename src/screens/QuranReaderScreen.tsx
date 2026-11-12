import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  Bookmark,
  BookmarkCheck,
  Menu,
  Moon,
  Sun,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  MoreHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  Type
} from 'lucide-react';
import { QuranAyahData, UserPreferences } from '../types';
import { ALL_SURAHS } from '../data/islamicData';
import { quranAudio, QuranAudioState, RECITERS_CATALOG } from '../services/quranAudioService';
import { RecitersLibraryModal } from '../components/RecitersLibraryModal';

interface QuranReaderScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onBackToPrayers: () => void;
}

export type MushafReadingMode = 'dark' | 'sepia' | 'day';

interface ReadingThemeStyle {
  id: MushafReadingMode;
  nameAr: string;
  badge: string;
  bgApp: string;
  bgPage: string;
  textAyah: string;
  headerText: string;
  borderOuter: string;
  borderInner: string;
  surahBannerBg: string;
  surahBannerBorder: string;
  surahBannerText: string;
  basmalaText: string;
  ayahMarker: string;
  activeAyahText: string;
  footerText: string;
}

const READING_THEMES: Record<MushafReadingMode, ReadingThemeStyle> = {
  dark: {
    id: 'dark',
    nameAr: 'الوضع الداكن (OLED)',
    badge: '🖤 أسود فاحم',
    bgApp: 'bg-[#000000]',
    bgPage: 'bg-[#000000]',
    textAyah: 'text-[#f5f5f5]',
    headerText: 'text-stone-300',
    borderOuter: 'border border-amber-500/30',
    borderInner: 'border border-amber-500/20',
    surahBannerBg: 'bg-[#0a0a0a]',
    surahBannerBorder: 'border-amber-500/50',
    surahBannerText: 'text-amber-300',
    basmalaText: 'text-amber-300',
    ayahMarker: 'text-amber-400',
    activeAyahText: 'text-[#fca5a5] font-bold drop-shadow',
    footerText: 'text-stone-400',
  },
  sepia: {
    id: 'sepia',
    nameAr: 'الوضع الورقي (الشامواه)',
    badge: '📜 ورق تراثي',
    bgApp: 'bg-[#f0e7d5]',
    bgPage: 'bg-[#FBF0D9]',
    textAyah: 'text-[#2b1810]',
    headerText: 'text-amber-950 font-bold',
    borderOuter: 'border border-amber-800/40',
    borderInner: 'border border-amber-700/20',
    surahBannerBg: 'bg-[#7c2d12]',
    surahBannerBorder: 'border-amber-600',
    surahBannerText: 'text-[#fef3c7]',
    basmalaText: 'text-[#451a03]',
    ayahMarker: 'text-[#92400e]',
    activeAyahText: 'text-[#b91c1c] font-black',
    footerText: 'text-amber-950/80',
  },
  day: {
    id: 'day',
    nameAr: 'وضع النهار (الأبيض)',
    badge: '☀️ أبيض ناصع',
    bgApp: 'bg-[#f4f6f8]',
    bgPage: 'bg-[#ffffff]',
    textAyah: 'text-[#111827]',
    headerText: 'text-emerald-950 font-bold',
    borderOuter: 'border border-emerald-600/30 shadow-md',
    borderInner: 'border border-emerald-500/20',
    surahBannerBg: 'bg-[#064e3b]',
    surahBannerBorder: 'border-emerald-500',
    surahBannerText: 'text-amber-200',
    basmalaText: 'text-emerald-950',
    ayahMarker: 'text-emerald-700',
    activeAyahText: 'text-emerald-600 font-bold',
    footerText: 'text-emerald-900/80',
  },
};

// Built-in fallback dataset for offline launch
const FALLBACK_PAGES: Record<string, QuranAyahData[]> = {
  "1": [
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 1, t: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 2, t: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 3, t: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 4, t: "مَٰلِكِ يَوْمِ ٱلدِّينِ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 5, t: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 6, t: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", j: 1, h: 1, sajda: false },
    { s: 1, sName: "سُورَةُ ٱلْفَاتِحَةِ", sType: "مكية", sCount: 7, a: 7, t: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", j: 1, h: 1, sajda: false }
  ],
  "488": [
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 45, t: "وَتَرَىٰهُمْ يُعْرَضُونَ عَلَيْهَا خَٰشِعِينَ مِنَ ٱلذُّلِّ يَنظُرُونَ مِن طَرْفٍ خَفِىٍّ ۗ وَقَالَ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ ٱلْخَٰسِرِينَ ٱلَّذِينَ خَسِرُوٓا۟ أَنفُسَهُمْ وَأَهْلِيهِمْ يَوْمَ ٱلْقِيَٰمَةِ ۗ أَلَآ إِنَّ ٱلظَّٰلِمِينَ فِى عَذَابٍ مُّقِيمٍ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 46, t: "وَمَا كَانَ لَهُم مِّنْ أَوْلِيَآءَ يَنصُرُونَهُم مِّن دُونِ ٱللَّهِ ۗ وَمَن يُضْلِلِ ٱللَّهُ فَمَا لَهُۥ مِن سَبِيلٍ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 47, t: "ٱسْتَجِيبُوا۟ لِرَبِّكُم مِّن قَبْلِ أَن يَأْتِىَ يَوْمٌ لَّا مَرَدَّ لَهُۥ مِنَ ٱللَّهِ ۚ مَا لَكُم مِّن مَّلْجَإٍ يَوْمَئِذٍ وَمَا لَكُم مِّن نَّكِيرٍ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 48, t: "فَإِنْ أَعْرَضُوا۟ فَمَآ أَرْسَلْنَٰكَ عَلَيْهِمْ حَفِيظًا ۖ إِنْ عَلَيْكَ إِلَّا ٱلْبَلَٰغُ ۗ وَإِنَّآ إِذَآ أَذَقْنَا ٱلْإِنسَٰنَ مِنَّا رَحْمَةً فَرِحَ بِهَا ۖ وَإِن تُصِبْهُمْ سَيِّئَةٌۢ بِمَا قَدَّمَتْ أَيْدِيهِمْ فَإِنَّ ٱلْإِنسَٰنَ كَفُورٌ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 49, t: "لِّلَّهِ مُلْكُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۚ يَخْلُقُ مَا يَشَآءُ ۚ يَهَبُ لِمَن يَشَآءُ إِنَٰثًا وَيَهَبُ لِمَن يَشَآءُ ٱلذُّكُورَ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 50, t: "أَوْ يُزَوِّجُهُمْ ذُكْرَانًا وَإِنَٰثًا ۖ وَيَجْعَلُ مَن يَشَآءُ عَقِيمًا ۚ إِنَّهُۥ عَلِيمٌ قَدِيرٌ", j: 25, h: 198, sajda: false },
    { s: 42, sName: "سُورَةُ الشُّورَىٰ", sType: "مكية", sCount: 53, a: 51, t: "وَمَا كَانَ لِبَشَرٍ أَن يُكَلِّمَهُ ٱللَّهُ إِلَّا وَحْيًا أَوْ مِن وَرَآىِٕ حِجَابٍ أَوْ يُرْسِلَ رَسُولًا فَيُوحِىَ بِإِذْنِهِۦ مَا يَشَآءُ ۚ إِنَّهُۥ عَلِىٌّ حَكِيمٌ", j: 25, h: 198, sajda: false }
  ],
  "602": [
    { s: 106, sName: "سُورَةُ قُرَيۡشٍ", sType: "مكية", sCount: 4, a: 1, t: "لِإِيلَٰفِ قُرَيْشٍ", j: 30, h: 240, sajda: false },
    { s: 106, sName: "سُورَةُ قُرَيۡشٍ", sType: "مكية", sCount: 4, a: 2, t: "إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ", j: 30, h: 240, sajda: false },
    { s: 106, sName: "سُورَةُ قُرَيۡشٍ", sType: "مكية", sCount: 4, a: 3, t: "فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ", j: 30, h: 240, sajda: false },
    { s: 106, sName: "سُورَةُ قُرَيۡشٍ", sType: "مكية", sCount: 4, a: 4, t: "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍۢ وَءَامَنَهُم مِّنْ خَوْفٍۭ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 1, t: "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 2, t: "فَذَٰلِكَ ٱلَّذِى يَدُعُّ ٱلْيَتِيمَ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 3, t: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ ٱلْمِسْكِينِ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 4, t: "فَوَيْلٌۭ لِّلْمُصَلِّينَ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 5, t: "ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 6, t: "ٱلَّذِينَ هُمْ يُرَآءُونَ", j: 30, h: 240, sajda: false },
    { s: 107, sName: "سُورَةُ المَاعُونِ", sType: "مكية", sCount: 7, a: 7, t: "وَيَمْنَعُونَ ٱلْمَاعُونَ", j: 30, h: 240, sajda: false },
    { s: 108, sName: "سُورَةُ الكَوۡثَرِ", sType: "مكية", sCount: 3, a: 1, t: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", j: 30, h: 240, sajda: false },
    { s: 108, sName: "سُورَةُ الكَوۡثَرِ", sType: "مكية", sCount: 3, a: 2, t: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", j: 30, h: 240, sajda: false },
    { s: 108, sName: "سُورَةُ الكَوۡثَرِ", sType: "مكية", sCount: 3, a: 3, t: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", j: 30, h: 240, sajda: false }
  ]
};

export const QuranReaderScreen: React.FC<QuranReaderScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onBackToPrayers,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(preferences.quranLastPage || 488);
  const [pagesData, setPagesData] = useState<Record<string, QuranAyahData[]> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3 Color Modes: 'dark' (OLED #000000) | 'sepia' (#FBF0D9) | 'day' (#FFFFFF)
  const [readingMode, setReadingMode] = useState<MushafReadingMode>(
    preferences.themePreset === 'light' ? 'day' : preferences.themePreset === 'glass' ? 'sepia' : 'dark'
  );

  // Immersive Mode: Tap screen to toggle header, floating audio bar, and bottom bar
  const [isImmersive, setIsImmersive] = useState<boolean>(false);

  // Audio Player State & Controls
  const [showAudioBar, setShowAudioBar] = useState<boolean>(true);
  const [audioState, setAudioState] = useState<QuranAudioState>(quranAudio.getState());
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(null);

  // Modals & Drawers
  const [showSurahIndex, setShowSurahIndex] = useState<boolean>(false);
  const [showRecitersModal, setShowRecitersModal] = useState<boolean>(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState<boolean>(false);
  const [showKhatmaModal, setShowKhatmaModal] = useState<boolean>(false);
  const [showMoreModal, setShowMoreModal] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [fontZoomPercent, setFontZoomPercent] = useState<number>(100);

  // Live formatted time for top bar (e.g. ١٢:٤٠ ص)
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('١٢:٤٠ ص');

  const [bookmarks, setBookmarks] = useState<number[]>(preferences.quranBookmarks || [488, 602]);

  // Touch Swipe Gesture References
  const touchStartXRef = useRef<number | null>(null);

  // Live time ticker in Arabic numerals
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isPm = hours >= 12;
      const h12 = hours % 12 || 12;
      const mStr = minutes.toString().padStart(2, '0');
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const hArabic = h12.toString().split('').map((d) => arabicDigits[parseInt(d, 10)]).join('');
      const mArabic = mStr.split('').map((d) => arabicDigits[parseInt(d, 10)]).join('');
      setCurrentTimeFormatted(`${hArabic}:${mArabic} ${isPm ? 'م' : 'ص'}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to Quran Audio Service
  useEffect(() => {
    return quranAudio.subscribe((st) => {
      setAudioState(st);
      if (st.isPlaying) {
        setSelectedAyahNumber(st.currentAyah);
      }
    });
  }, []);

  // Connect Audio Service Next / Prev Ayah Handlers
  useEffect(() => {
    quranAudio.setNextAyahHandler(() => {
      advanceAyah(1);
    });
    quranAudio.setPrevAyahHandler(() => {
      advanceAyah(-1);
    });
  }, [currentPage, pagesData]);

  // Load Quran pages JSON with offline caching resilience
  useEffect(() => {
    let isMounted = true;
    fetch('/data/quran_pages.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPagesData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Network fetch for quran_pages.json failed, using fallback:', err);
        if (isMounted) {
          setPagesData(FALLBACK_PAGES);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const savePage = (page: number) => {
    const clamped = Math.max(1, Math.min(604, page));
    setCurrentPage(clamped);
    setSelectedAyahNumber(null);
    onUpdatePreferences({
      ...preferences,
      quranLastPage: clamped,
    });
  };

  const toggleBookmark = (pageToBookmark?: number) => {
    const target = pageToBookmark ?? currentPage;
    let updated: number[];
    if (bookmarks.includes(target)) {
      updated = bookmarks.filter((p) => p !== target);
    } else {
      updated = [...bookmarks, target].sort((a, b) => a - b);
    }
    setBookmarks(updated);
    onUpdatePreferences({
      ...preferences,
      quranBookmarks: updated,
    });
  };

  const isCurrentPageBookmarked = bookmarks.includes(currentPage);

  // Ayahs for current page
  const currentAyahs: QuranAyahData[] = useMemo(() => {
    if (pagesData && pagesData[currentPage.toString()]) {
      return pagesData[currentPage.toString()];
    }
    if (FALLBACK_PAGES[currentPage.toString()]) {
      return FALLBACK_PAGES[currentPage.toString()];
    }
    return [];
  }, [pagesData, currentPage]);

  const firstAyah = currentAyahs[0];
  const currentSurahName = firstAyah ? firstAyah.sName : 'سُورَةُ الشُّورَىٰ';
  const currentSurahNumber = firstAyah ? firstAyah.s : 42;
  const currentJuz = firstAyah ? firstAyah.j : 25;
  const surahMeta = ALL_SURAHS.find((s) => s.number === currentSurahNumber);
  const versesTotalCount = surahMeta ? surahMeta.versesCount : 53;

  // Filter surahs for index modal
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return ALL_SURAHS;
    const q = surahSearchQuery.trim().toLowerCase();
    return ALL_SURAHS.filter(
      (s) =>
        s.nameAr.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.number.toString() === q
    );
  }, [surahSearchQuery]);

  // Group ayahs by surah on this page
  const ayahsBySurah = useMemo(() => {
    const groups: { surahNumber: number; surahName: string; ayahs: QuranAyahData[] }[] = [];
    currentAyahs.forEach((a) => {
      let g = groups.find((grp) => grp.surahNumber === a.s);
      if (!g) {
        g = { surahNumber: a.s, surahName: a.sName, ayahs: [] };
        groups.push(g);
      }
      g.ayahs.push(a);
    });
    return groups;
  }, [currentAyahs]);

  // Clean Ayah Text: Strip duplicate Basmala so it only displays once in the prominent header
  const formatAyahText = (ayah: QuranAyahData, surahNumber: number): string => {
    if (ayah.a === 1 && surahNumber !== 1 && surahNumber !== 9) {
      return ayah.t.replace(/^بِ?سْمِ\s+ٱ?للَّ?هِ\s+ٱ?لرَّحْمَٰ?نِ\s+ٱ?لرَّحِيمِ\s*/u, '').trim();
    }
    return ayah.t;
  };

  // Clean Surah Title: Display `{ سُورَةُ ... }` without repeating the word سورة
  const formatSurahHeading = (rawName: string): string => {
    const trimmed = rawName.trim();
    if (trimmed.startsWith('سُورَةُ') || trimmed.startsWith('سورة')) {
      return `{ ${trimmed} }`;
    }
    return `{ سُورَةُ ${trimmed} }`;
  };

  // Eastern Arabic numerals for ayah end marker (۝١, ۝٢, etc.)
  const toEasternArabicNumerals = (num: number): string => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map((d) => arabicDigits[parseInt(d, 10)]).join('');
  };

  // Touch Swipe Handlers for effortless mobile reading
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    // In RTL reading:
    // Swiping right to left (diff < -50) goes to NEXT page
    // Swiping left to right (diff > 50) goes to PREV page
    if (diff < -50 && currentPage < 604) {
      savePage(currentPage + 1);
    } else if (diff > 50 && currentPage > 1) {
      savePage(currentPage - 1);
    }
  };

  // Advance Ayah in audio player
  const advanceAyah = (step: number) => {
    if (currentAyahs.length === 0) return;
    const curAyahNum = selectedAyahNumber || (firstAyah ? firstAyah.a : 1);
    const curIdx = currentAyahs.findIndex((a) => a.a === curAyahNum);

    if (step > 0) {
      if (curIdx >= 0 && curIdx < currentAyahs.length - 1) {
        const next = currentAyahs[curIdx + 1];
        setSelectedAyahNumber(next.a);
        quranAudio.playAyah(next.s, next.a, next.sName);
      } else if (currentPage < 604) {
        // Go to next page
        savePage(currentPage + 1);
      }
    } else {
      if (curIdx > 0) {
        const prev = currentAyahs[curIdx - 1];
        setSelectedAyahNumber(prev.a);
        quranAudio.playAyah(prev.s, prev.a, prev.sName);
      } else if (currentPage > 1) {
        savePage(currentPage - 1);
      }
    }
  };

  // Play a specific ayah clicked by the user
  const handleAyahClick = (ayah: QuranAyahData) => {
    setSelectedAyahNumber(ayah.a);
    setShowAudioBar(true);
    quranAudio.playAyah(ayah.s, ayah.a, ayah.sName);
  };

  // Cycle reading theme: dark -> sepia -> day -> dark
  const cycleReadingTheme = () => {
    const next: MushafReadingMode =
      readingMode === 'dark' ? 'sepia' : readingMode === 'sepia' ? 'day' : 'dark';
    setReadingMode(next);
  };

  const themeConfig = READING_THEMES[readingMode];
  const baseFontSize = Math.round(24 * (fontZoomPercent / 100));

  // Khatma calculation: 604 pages total
  const khatmaPercent = Math.min(100, Math.round((currentPage / 604) * 100));

  return (
    <div
      className={`min-h-screen select-none transition-colors duration-300 ${themeConfig.bgApp} relative flex flex-col justify-between overflow-x-hidden`}
      dir="rtl"
    >
      {/* ======================================================== */}
      {/* 1. TOP BAR (Screenshots 2 & 3)                           */}
      {/* ======================================================== */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 px-4 py-2.5 bg-black/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between text-white shadow-xl ${
          isImmersive ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Right side: Search & Dual-page icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSurahIndex(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
            title="بحث في السور"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowMoreModal(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
            title="إعدادات العرض وتكبير الخط"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            onClick={onBackToPrayers}
            className="p-1.5 px-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-serif font-bold flex items-center gap-1 hover:bg-emerald-900 transition-colors"
            title="رجوع للمواقيت الرئيسية"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">المواقيت</span>
          </button>
        </div>

        {/* Center: Live Time / Clock in Arabic (Screenshot 2: ١٢:٤٠ ص) */}
        <div className="text-center">
          <span className="font-mono font-bold text-sm sm:text-base tracking-wider text-stone-200">
            {currentTimeFormatted}
          </span>
        </div>

        {/* Left side: Theme cycle (Moon/Sun) & Hamburger Menu */}
        <div className="flex items-center gap-2">
          {/* Theme cycle button */}
          <button
            onClick={cycleReadingTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-200 transition-colors"
            title={`تغيير المظهر: حالياً ${themeConfig.badge}`}
          >
            {readingMode === 'dark' ? (
              <Moon className="w-5 h-5 text-amber-300 fill-amber-300/30" />
            ) : readingMode === 'sepia' ? (
              <Sparkles className="w-5 h-5 text-amber-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          {/* Surah & Juz Index Hamburger */}
          <button
            onClick={() => setShowSurahIndex(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
            title="قائمة الفهرس"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN QURAN PAGE CONTAINER (Screenshot 3 & Immersive)   */}
      {/* ======================================================== */}
      <main
        className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col justify-start cursor-pointer"
        onClick={() => setIsImmersive(!isImmersive)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && currentAyahs.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-sm text-amber-300 font-serif">جاري فتح صفحة المصحف الشريف...</p>
          </div>
        ) : (
          <div
            className={`w-full rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 ${themeConfig.bgPage} ${themeConfig.borderOuter} shadow-2xl flex flex-col justify-between min-h-[75vh]`}
          >
            {/* Page Header (Screenshot 3: ٤٢ الشورى (٥٣)   ٤٨٨   الجزء ٢٥ (٨/٣) 🏷️) */}
            <div
              className={`flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 text-xs sm:text-sm font-serif ${themeConfig.headerText}`}
            >
              {/* Right: Surah Number & Name & Verses Count */}
              <div className="font-bold flex items-center gap-1.5">
                <span>
                  {toEasternArabicNumerals(currentSurahNumber)}{' '}
                  {currentSurahName.replace(/^سُورَةُ\s+/u, '')}
                </span>
                <span className="font-mono text-xs opacity-80">
                  ({toEasternArabicNumerals(versesTotalCount)})
                </span>
              </div>

              {/* Center: Page Number with Underscores (e.g. ــ ٤٨٨ ــ) */}
              <div className="font-mono font-bold text-xs sm:text-sm tracking-widest">
                ـ {toEasternArabicNumerals(currentPage)} ـ
              </div>

              {/* Left: Juz & Hizb Quarter with Bookmark Flag Icon */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold">
                  الجزء {toEasternArabicNumerals(currentJuz)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark();
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title={isCurrentPageBookmarked ? 'إزالة الفاصل' : 'حفظ الفاصل'}
                >
                  {isCurrentPageBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-stone-400 hover:text-amber-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Page Content: Surahs & Ayahs (Continuous Mushaf Flow) */}
            <div className="py-4 sm:py-6 space-y-6 flex-1 flex flex-col justify-center">
              {ayahsBySurah.map((group) => {
                const isBeginningOfSurah = group.ayahs.some((a) => a.a === 1);
                const showBasmala = isBeginningOfSurah && group.surahNumber !== 1 && group.surahNumber !== 9;

                return (
                  <div key={group.surahNumber} className="space-y-4">
                    {/* Ornamental Surah Cartridge Header if new surah starts on this page */}
                    {isBeginningOfSurah && (
                      <div className="text-center my-3">
                        <div
                          className={`inline-block px-6 py-2 rounded-2xl border font-serif font-black text-sm tracking-wide shadow-md ${themeConfig.surahBannerBg} ${themeConfig.surahBannerBorder} ${themeConfig.surahBannerText}`}
                        >
                          {formatSurahHeading(group.surahName)}
                        </div>

                        {showBasmala && (
                          <div
                            className={`font-serif text-lg sm:text-xl font-bold mt-3 tracking-widest ${themeConfig.basmalaText}`}
                          >
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </div>
                        )}
                      </div>
                    )}

                    {/* Continuous Ayahs Flow */}
                    <p
                      className={`text-center font-serif leading-[2.6] sm:leading-[2.8] select-text transition-all ${themeConfig.textAyah}`}
                      style={{ fontSize: `${baseFontSize}px` }}
                    >
                      {group.ayahs.map((ayah) => {
                        const verseText = formatAyahText(ayah, group.surahNumber);
                        const isSelectedAyah = selectedAyahNumber === ayah.a && audioState.currentSurah === group.surahNumber;

                        return (
                          <span
                            key={ayah.a}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAyahClick(ayah);
                            }}
                            className={`inline mx-1 cursor-pointer transition-colors rounded px-0.5 ${
                              isSelectedAyah ? themeConfig.activeAyahText : 'hover:opacity-80'
                            }`}
                          >
                            {verseText}{' '}
                            <span
                              className={`inline-flex items-center justify-center font-serif font-bold mx-1 text-[0.88em] align-middle select-none ${themeConfig.ayahMarker}`}
                            >
                              ۝{toEasternArabicNumerals(ayah.a)}
                            </span>
                          </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Page Footer: Nav Buttons & Page Number */}
            <div
              className={`pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs ${themeConfig.footerText}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  savePage(currentPage + 1);
                }}
                disabled={currentPage >= 604}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all font-serif flex items-center gap-1"
              >
                <span>التالي</span>
                <span>←</span>
              </button>

              <span className="font-serif font-bold text-xs sm:text-sm">
                ـ {toEasternArabicNumerals(currentPage)} ـ
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  savePage(currentPage - 1);
                }}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all font-serif flex items-center gap-1"
              >
                <span>→</span>
                <span>السابق</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 3. FLOATING AUDIO PLAYER PILL (Screenshot 1)              */}
      {/* ... | ∞ | << | ▶ / ⏸ | >> | ✖                            */}
      {/* ======================================================== */}
      {showAudioBar && (
        <div
          className={`fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-40 transition-all duration-300 ${
            isImmersive ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="rounded-full bg-[#1c1c1e]/95 border border-white/15 backdrop-blur-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between text-stone-200">
            {/* 1. Reciters Library & Audio Options (...) */}
            <button
              onClick={() => setShowRecitersModal(true)}
              className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              title="مكتبة القراء وإعدادات الصوت"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* 2. Loop / Repeat Mode (∞) */}
            <button
              onClick={() => quranAudio.toggleLoopMode()}
              className={`p-2 rounded-full transition-colors ${
                audioState.loopMode === 'ayah'
                  ? 'text-amber-400 bg-amber-400/20'
                  : audioState.loopMode === 'surah'
                  ? 'text-emerald-400 bg-emerald-400/20'
                  : 'text-stone-400 hover:text-white'
              }`}
              title={
                audioState.loopMode === 'ayah'
                  ? 'تكرار الآية الحالية (مفعل)'
                  : audioState.loopMode === 'surah'
                  ? 'تكرار السورة كاملة'
                  : 'التشغيل التلقائي العادي'
              }
            >
              <Repeat className="w-5 h-5" />
            </button>

            {/* 3. Prev Ayah (<<) */}
            <button
              onClick={() => advanceAyah(-1)}
              className="p-2 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition-colors active:scale-95"
              title="الآية السابقة"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* 4. Play / Pause Button (▶ / ⏸) */}
            <button
              onClick={() => {
                if (audioState.isPlaying) {
                  quranAudio.pause();
                } else {
                  const targetAyah = selectedAyahNumber || (firstAyah ? firstAyah.a : 1);
                  quranAudio.playAyah(currentSurahNumber, targetAyah, currentSurahName);
                }
              }}
              className="p-3 rounded-full bg-white text-black hover:bg-amber-300 transition-all shadow-lg active:scale-95"
              title={audioState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
            >
              {audioState.isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* 5. Next Ayah (>>) */}
            <button
              onClick={() => advanceAyah(1)}
              className="p-2 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition-colors active:scale-95"
              title="الآية التالية"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* 6. Close Audio Bar (✖) */}
            <button
              onClick={() => {
                quranAudio.stop();
                setShowAudioBar(false);
              }}
              className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-red-400 transition-colors"
              title="إغلاق مشغل الصوت"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. BOTTOM DOCK (Screenshot 1: 5-Item Navigation Bar)     */}
      {/* المصحف | ختمة | الفهرس | علاماتي | المزيد                */}
      {/* ======================================================== */}
      <nav
        className={`sticky bottom-0 z-30 transition-all duration-300 bg-[#121214]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2 flex items-center justify-around text-stone-400 shadow-2xl ${
          isImmersive ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* 1. المصحف (Selected with green indicator and arrow) */}
        <button
          onClick={() => {
            if (!showAudioBar) setShowAudioBar(true);
          }}
          className="flex flex-col items-center gap-0.5 text-emerald-400 font-bold group"
        >
          <div className="relative">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1.5 -right-1 text-[10px] text-emerald-400 leading-none">
              ^
            </span>
          </div>
          <span className="text-[11px] font-serif">المصحف</span>
        </button>

        {/* 2. ختمة (Khatma progress) */}
        <button
          onClick={() => setShowKhatmaModal(true)}
          className="flex flex-col items-center gap-0.5 hover:text-stone-200 transition-colors"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[11px] font-serif">ختمة</span>
        </button>

        {/* 3. الفهرس (Geometric octagram / index) */}
        <button
          onClick={() => setShowSurahIndex(true)}
          className="flex flex-col items-center gap-0.5 hover:text-stone-200 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px] font-serif">الفهرس</span>
        </button>

        {/* 4. علاماتي (Bookmarks) */}
        <button
          onClick={() => setShowBookmarksModal(true)}
          className="flex flex-col items-center gap-0.5 hover:text-stone-200 transition-colors"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[11px] font-serif">علاماتي</span>
        </button>

        {/* 5. المزيد (Settings, Reciters, Fonts, Themes) */}
        <button
          onClick={() => setShowMoreModal(true)}
          className="flex flex-col items-center gap-0.5 hover:text-stone-200 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[11px] font-serif">المزيد</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 5. SURAH & JUZ INDEX MODAL (فهرس السور والأجزاء)         */}
      {/* ======================================================== */}
      {showSurahIndex && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-amber-300 font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>فهرس سور القرآن الكريم</span>
              </h3>
              <button
                onClick={() => setShowSurahIndex(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-emerald-400/60" />
              <input
                type="text"
                value={surahSearchQuery}
                onChange={(e) => setSurahSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم السورة أو رقمها..."
                className="w-full pr-9 pl-4 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-white text-xs placeholder:text-emerald-400/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    savePage(surah.startPage);
                    setShowSurahIndex(false);
                  }}
                  className={`w-full text-right p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    currentSurahNumber === surah.number
                      ? 'bg-amber-500/20 border-amber-400/70 text-amber-300'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/20 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-black/40 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-amber-300">
                      {toEasternArabicNumerals(surah.number)}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm font-serif">{surah.nameAr}</h4>
                      <div className="text-[10px] text-emerald-300/60 font-mono">
                        {surah.type} • {toEasternArabicNumerals(surah.versesCount)} آية
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-amber-400">
                    صـ {toEasternArabicNumerals(surah.startPage)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. BOOKMARKS MODAL (علاماتي المحفوظة)                      */}
      {/* ======================================================== */}
      {showBookmarksModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-amber-300 font-serif flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-amber-400" />
                <span>علاماتي وفواصل القراءة</span>
              </h3>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs font-serif">
                  لم تحفظ أي فواصل بعد. اضغط على أيقونة الفاصل بأعلى الصفحة لحفظها.
                </div>
              ) : (
                bookmarks.map((pNum) => (
                  <div
                    key={pNum}
                    className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center justify-between"
                  >
                    <button
                      onClick={() => {
                        savePage(pNum);
                        setShowBookmarksModal(false);
                      }}
                      className="text-right flex-1 font-serif text-sm text-white hover:text-amber-300"
                    >
                      <span className="font-bold">صفحة {toEasternArabicNumerals(pNum)}</span>
                    </button>

                    <button
                      onClick={() => toggleBookmark(pNum)}
                      className="text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/20 font-serif"
                    >
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-emerald-500/20 text-center">
              <button
                onClick={() => toggleBookmark(currentPage)}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-serif flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>حفظ الصفحة الحالية (صـ {toEasternArabicNumerals(currentPage)})</span>
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. KHATMA TRACKER MODAL (متابعة الختمة القرآنية)           */}
      {/* ======================================================== */}
      {showKhatmaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-amber-300 font-serif flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>متابعة الختمة القرآنية المباركة</span>
              </h3>
              <button
                onClick={() => setShowKhatmaModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-center space-y-3">
              <span className="text-3xl font-black text-amber-300 font-mono">
                {khatmaPercent}%
              </span>
              <p className="text-xs text-emerald-200 font-serif">
                قرأت حتى صفحة {toEasternArabicNumerals(currentPage)} من أصل ٦٠٤ صفحة
              </p>

              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${khatmaPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-300 font-serif">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="block opacity-70">المتبقي للختم</span>
                  <span className="font-bold text-amber-300">
                    {toEasternArabicNumerals(604 - currentPage)} صفحة
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="block opacity-70">الجزء الحالي</span>
                  <span className="font-bold text-emerald-300">
                    الجزء {toEasternArabicNumerals(currentJuz)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowKhatmaModal(false)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-serif"
            >
              متابعة القراءة الآن
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MORE SETTINGS & FONT CONTROLS MODAL (المزيد)           */}
      {/* ======================================================== */}
      {showMoreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-amber-300 font-serif flex items-center gap-2">
                <MoreHorizontal className="w-5 h-5 text-emerald-400" />
                <span>خيارات وضبط المصحف الشريف</span>
              </h3>
              <button
                onClick={() => setShowMoreModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Reading Themes Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-300 font-serif block">
                أوضاع القراءة والألوان (3 أوضاع):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(READING_THEMES) as MushafReadingMode[]).map((tId) => {
                  const t = READING_THEMES[tId];
                  const isCur = readingMode === tId;
                  return (
                    <button
                      key={tId}
                      onClick={() => setReadingMode(tId)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isCur
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs">{t.badge.split(' ')[0]}</div>
                      <div className="text-[11px] font-serif mt-1">{t.nameAr.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Zoom Slider */}
            <div className="space-y-2 pt-2 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-xs font-serif text-emerald-200">
                <span className="flex items-center gap-1">
                  <Type className="w-4 h-4 text-amber-400" />
                  حجم خط الآيات
                </span>
                <span className="font-mono text-amber-300">{fontZoomPercent}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={150}
                value={fontZoomPercent}
                onChange={(e) => setFontZoomPercent(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-black/50 rounded-lg"
              />
            </div>

            {/* Reciter Library Button */}
            <div className="pt-2 border-t border-emerald-500/20">
              <button
                onClick={() => {
                  setShowMoreModal(false);
                  setShowRecitersModal(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold font-serif flex items-center justify-center gap-2 shadow-lg"
              >
                <span>مكتبة القراء والتنزيل الأوفلاين</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. RECITERS LIBRARY MODAL                                 */}
      {/* ======================================================== */}
      <RecitersLibraryModal
        isOpen={showRecitersModal}
        onClose={() => setShowRecitersModal(false)}
        activeReciterId={audioState.reciterId}
        onSelectReciter={(rId) => quranAudio.setReciter(rId)}
        currentSurahNumber={currentSurahNumber}
      />
    </div>
  );
};
