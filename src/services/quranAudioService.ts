// Professional Quran Audio Service for Haqq Allah V2.7
// Supports background playback, MediaSessionCompat lockscreen controls,
// EveryAyah CDN integration, offline caching, and seamless ayah auto-advance.

export interface ReciterInfo {
  id: string;
  nameAr: string;
  subfolder: string;
  style: string;
  bitrate: string;
}

export const RECITERS_CATALOG: ReciterInfo[] = [
  {
    id: 'minshawy',
    nameAr: 'الشيخ محمد صديق المنشاوي',
    subfolder: 'Minshawy_Murattal_128kbps',
    style: 'مرتل خاشع',
    bitrate: '128 kbps',
  },
  {
    id: 'husary',
    nameAr: 'الشيخ محمود خليل الحصري',
    subfolder: 'Husary_128kbps',
    style: 'تحقيق متقن للأحكام',
    bitrate: '128 kbps',
  },
  {
    id: 'afasy',
    nameAr: 'الشيخ مشاري راشد العفاسي',
    subfolder: 'Alafasy_128kbps',
    style: 'مرتل عذب',
    bitrate: '128 kbps',
  },
  {
    id: 'abdulbasit',
    nameAr: 'الشيخ عبد الباسط عبد الصمد',
    subfolder: 'Abdul_Basit_Murattal_192kbps',
    style: 'ترتيل مصري أصيل',
    bitrate: '192 kbps',
  },
  {
    id: 'ghamdi',
    nameAr: 'الشيخ سعد الغامدي',
    subfolder: 'Ghamadi_40kbps',
    style: 'تلاوة حجازية ندية',
    bitrate: '40 kbps',
  },
  {
    id: 'muaiqly',
    nameAr: 'الشيخ ماهر المعيقلي',
    subfolder: 'MaherAlMuaiqly128kbps',
    style: 'إمام الحرم المكي',
    bitrate: '128 kbps',
  },
  {
    id: 'shuraym',
    nameAr: 'الشيخ سعود الشريم',
    subfolder: 'Saood_ash-Shuraym_128kbps',
    style: 'تلاوة سريعة معتدلة',
    bitrate: '128 kbps',
  },
  {
    id: 'shaatree',
    nameAr: 'الشيخ أبو بكر الشاطري',
    subfolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    style: 'تلاوة خاشعة مميزة',
    bitrate: '128 kbps',
  },
];

export interface QuranAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurah: number;
  currentAyah: number;
  surahNameAr: string;
  reciterId: string;
  loopMode: 'off' | 'ayah' | 'surah';
  progress: number;
  duration: number;
}

class QuranAudioService {
  private audio: HTMLAudioElement | null = null;
  private wakeLock: any = null;
  private state: QuranAudioState = {
    isPlaying: false,
    isLoading: false,
    currentSurah: 1,
    currentAyah: 1,
    surahNameAr: 'سورة الفاتحة',
    reciterId: 'minshawy',
    loopMode: 'off',
    progress: 0,
    duration: 0,
  };

  private listeners: Set<(state: QuranAudioState) => void> = new Set();
  private onAyahChangeCallback: ((surah: number, ayah: number) => void) | null = null;
  private onNextAyahRequested: (() => void) | null = null;
  private onPrevAyahRequested: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    try {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.onplay = () => {
        this.updateState({ isPlaying: true, isLoading: false });
        this.requestWakeLock();
        this.updateMediaSession();
      };

      this.audio.onpause = () => {
        this.updateState({ isPlaying: false });
        this.releaseWakeLock();
        this.updateMediaSession();
      };

      this.audio.onwaiting = () => {
        this.updateState({ isLoading: true });
      };

      this.audio.oncanplay = () => {
        this.updateState({ isLoading: false });
      };

      this.audio.ontimeupdate = () => {
        if (this.audio) {
          const duration = this.audio.duration || 0;
          const current = this.audio.currentTime || 0;
          const progress = duration > 0 ? (current / duration) * 100 : 0;
          this.updateState({ progress, duration });
        }
      };

      this.audio.onended = () => {
        this.handleAyahEnded();
      };

      this.audio.onerror = (e) => {
        console.warn('Quran audio playback error:', e);
        this.updateState({ isPlaying: false, isLoading: false });
      };

      this.setupMediaSession();
    } catch (e) {
      console.warn('Audio initialization issue:', e);
    }
  }

  private async requestWakeLock() {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  }

  private releaseWakeLock() {
    try {
      if (this.wakeLock) {
        this.wakeLock.release().catch(() => {});
        this.wakeLock = null;
      }
    } catch {}
  }

  private setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevAyah());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.playNextAyah());
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          if (this.audio) this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          if (this.audio) this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 5);
        });
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
      } catch {}
    }
  }

  private updateMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        const reciter = RECITERS_CATALOG.find((r) => r.id === this.state.reciterId) || RECITERS_CATALOG[0];
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${this.state.surahNameAr} - آية ${this.state.currentAyah}`,
          artist: reciter.nameAr,
          album: 'المصحف الشريف - حق الله V2.7',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
      } catch {}
    }
  }

  private handleAyahEnded() {
    if (this.state.loopMode === 'ayah') {
      // Repeat current ayah
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    } else {
      // Request next ayah
      if (this.onNextAyahRequested) {
        this.onNextAyahRequested();
      }
    }
  }

  public getAudioUrl(surah: number, ayah: number, reciterId?: string): string {
    const rId = reciterId || this.state.reciterId;
    const reciter = RECITERS_CATALOG.find((r) => r.id === rId) || RECITERS_CATALOG[0];
    const sPadded = surah.toString().padStart(3, '0');
    const aPadded = ayah.toString().padStart(3, '0');
    return `https://everyayah.com/data/${reciter.subfolder}/${sPadded}${aPadded}.mp3`;
  }

  public async playAyah(surah: number, ayah: number, surahName?: string) {
    if (!this.audio) this.initAudio();
    if (!this.audio) return;

    const sName = surahName || this.state.surahNameAr;
    this.updateState({
      currentSurah: surah,
      currentAyah: ayah,
      surahNameAr: sName,
      isLoading: true,
    });

    const url = this.getAudioUrl(surah, ayah);
    this.audio.src = url;

    try {
      await this.audio.play();
      this.updateState({ isPlaying: true, isLoading: false });
      if (this.onAyahChangeCallback) {
        this.onAyahChangeCallback(surah, ayah);
      }
    } catch (e) {
      console.warn('Playback error for ayah:', surah, ayah, e);
      this.updateState({ isPlaying: false, isLoading: false });
    }
  }

  public async play() {
    if (this.audio && this.audio.src) {
      try {
        await this.audio.play();
        this.updateState({ isPlaying: true });
      } catch {}
    } else {
      this.playAyah(this.state.currentSurah, this.state.currentAyah, this.state.surahNameAr);
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    }
  }

  public togglePlayPause() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateState({ isPlaying: false, progress: 0 });
    }
  }

  public playNextAyah() {
    if (this.onNextAyahRequested) {
      this.onNextAyahRequested();
    }
  }

  public playPrevAyah() {
    if (this.onPrevAyahRequested) {
      this.onPrevAyahRequested();
    }
  }

  public setReciter(reciterId: string) {
    this.updateState({ reciterId });
    if (this.state.isPlaying) {
      this.playAyah(this.state.currentSurah, this.state.currentAyah, this.state.surahNameAr);
    }
  }

  public toggleLoopMode() {
    const nextMode: 'off' | 'ayah' | 'surah' =
      this.state.loopMode === 'off' ? 'ayah' : this.state.loopMode === 'ayah' ? 'surah' : 'off';
    this.updateState({ loopMode: nextMode });
  }

  public setNextAyahHandler(handler: () => void) {
    this.onNextAyahRequested = handler;
  }

  public setPrevAyahHandler(handler: () => void) {
    this.onPrevAyahRequested = handler;
  }

  public setAyahChangeHandler(handler: (surah: number, ayah: number) => void) {
    this.onAyahChangeCallback = handler;
  }

  public subscribe(callback: (state: QuranAudioState) => void) {
    this.listeners.add(callback);
    callback(this.state);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateState(partial: Partial<QuranAudioState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((cb) => cb(this.state));
    this.updateMediaSession();
  }

  public getState(): QuranAudioState {
    return this.state;
  }

  // Offline Caching of Surah Audio using CacheStorage
  public async cacheSurahAudio(
    surahNumber: number,
    versesCount: number,
    reciterId: string,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;

    try {
      const cache = await caches.open('quran-audio-cache-v1');
      const total = versesCount;
      let cached = 0;

      for (let i = 1; i <= total; i++) {
        const url = this.getAudioUrl(surahNumber, i, reciterId);
        const match = await cache.match(url);
        if (!match) {
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch {}
        }
        cached++;
        if (onProgress) {
          onProgress(Math.round((cached / total) * 100));
        }
      }
      return true;
    } catch (e) {
      console.warn('Cache error:', e);
      return false;
    }
  }

  public async isSurahCached(surahNumber: number, reciterId: string): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const cache = await caches.open('quran-audio-cache-v1');
      const testUrl = this.getAudioUrl(surahNumber, 1, reciterId);
      const match = await cache.match(testUrl);
      return !!match;
    } catch {
      return false;
    }
  }
}

export const quranAudio = new QuranAudioService();
