// Audio service for Adhan and Tasbeeh sound effects

class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isPlayingAdhan: boolean = false;
  private onStateChangeCallbacks: Set<(isPlaying: boolean) => void> = new Set();
  private volume: number = 0.85;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    try {
      this.audioElement = new Audio('/audio/default_azan.mp3');
      this.audioElement.volume = this.volume;
      this.audioElement.onplay = () => this.setPlayingState(true);
      this.audioElement.onended = () => this.setPlayingState(false);
      this.audioElement.onpause = () => this.setPlayingState(false);
      this.audioElement.onerror = () => {
        // Fallback to Web Audio API synthesis if file playback encounters an issue
        this.setPlayingState(false);
      };
    } catch {
      // Audio not supported in environment
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public subscribe(callback: (isPlaying: boolean) => void) {
    this.onStateChangeCallbacks.add(callback);
    callback(this.isPlayingAdhan);
    return () => {
      this.onStateChangeCallbacks.delete(callback);
    };
  }

  private wakeLock: any = null;

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

  private setPlayingState(isPlaying: boolean) {
    this.isPlayingAdhan = isPlaying;
    if (!isPlaying) {
      this.releaseWakeLock();
    }
    this.onStateChangeCallbacks.forEach(cb => cb(isPlaying));
  }

  public async playAdhan(source: string = 'default'): Promise<void> {
    this.stopAdhan();

    // Haptic feedback if available (Adhan rhythmic vibration)
    this.vibrate([200, 100, 200, 100, 400]);

    // Request screen wake lock so audio continues even with screen off
    await this.requestWakeLock();

    // Setup MediaSession for background audio priority
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'أذان الصلاة المفروضة - حق الله',
          artist: 'نداء الحق والفلاح',
          album: 'حق الله V2.7',
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('stop', () => this.stopAdhan());
        navigator.mediaSession.setActionHandler('pause', () => this.stopAdhan());
      } catch {}
    }

    if (!this.audioElement) {
      this.initAudioElement();
    }

    if (this.audioElement && source === 'default') {
      try {
        this.audioElement.currentTime = 0;
        await this.audioElement.play();
        this.setPlayingState(true);
        return;
      } catch {
        // Autoplay policy or error, fallback to Web Audio chime
      }
    }

    // Play synthetic harmonic adhan/chime through Web Audio API
    this.playHarmonicChime();
  }

  public stopAdhan() {
    this.releaseWakeLock();
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch {}
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.setPlayingState(false);
  }

  public isPlaying(): boolean {
    return this.isPlayingAdhan;
  }

  /**
   * Generates a warm Islamic peaceful chime sequence using Web Audio API
   */
  public playHarmonicChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.setPlayingState(true);

      const notes = [
        { freq: 440, duration: 1.2, delay: 0 },      // A4
        { freq: 493.88, duration: 1.2, delay: 1.0 },   // B4
        { freq: 523.25, duration: 1.5, delay: 2.0 },   // C5 (Hijaz feel)
        { freq: 659.25, duration: 1.8, delay: 3.2 },   // E5
        { freq: 587.33, duration: 2.5, delay: 4.8 }    // D5
      ];

      const now = this.audioContext.currentTime;
      let totalDuration = 0;

      notes.forEach(({ freq, duration, delay }) => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        // Soft bell envelope
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + delay + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration);

        if (delay + duration > totalDuration) {
          totalDuration = delay + duration;
        }
      });

      setTimeout(() => {
        this.setPlayingState(false);
      }, totalDuration * 1000);
    } catch {
      this.setPlayingState(false);
    }
  }

  /**
   * Subtle click for tasbeeh counter
   */
  public playTasbeehClick() {
    this.vibrate(35);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
      setTimeout(() => ctx.close().catch(() => {}), 100);
    } catch {}
  }

  /**
   * Joyful celebration chime when a zikr target is reached
   */
  public playZikrCompleted() {
    this.vibrate([60, 40, 80, 40, 120]);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      const now = ctx.currentTime;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.85);
      });

      setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch {}
  }

  private vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const audioService = new AudioService();
