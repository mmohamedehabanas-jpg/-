import React, { useState, useEffect, useRef } from 'react';
import { Compass, X, Check } from 'lucide-react';
import { calculateDistanceToKaaba, calculateQiblaBearing } from '../services/prayerCalculator';

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
  cityName: string;
  countryName: string;
  onRefreshGps?: () => void;
  onClose: () => void;
}

export const QiblaCompassDialog: React.FC<QiblaCompassProps> = ({
  latitude,
  longitude,
  cityName,
  countryName,
  onRefreshGps,
  onClose,
}) => {
  const qiblaAngle = calculateQiblaBearing(latitude, longitude);
  const distanceKm = calculateDistanceToKaaba(latitude, longitude);

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [manualSlider, setManualSlider] = useState<number>(0);
  const lastVibratedRef = useRef<number>(0);

  const effectiveHeading = hasSensor ? deviceHeading : manualSlider;
  const relativeAngle = (qiblaAngle - effectiveHeading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) <= 6 || Math.abs(relativeAngle - 360) <= 6;

  useEffect(() => {
    if (isAligned && Date.now() - lastVibratedRef.current > 1500) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([70, 40, 90]);
        } catch {}
      }
      lastVibratedRef.current = Date.now();
    }
  }, [isAligned]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;
      if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
        setHasSensor(true);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#14261f] via-[#0d1c16] to-[#07130e] border border-emerald-500/30 rounded-3xl p-5 shadow-2xl text-white space-y-4">
        {/* 1. Header: Close button on left, Title on right */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center flex-1">
            <h2 className="font-serif font-black text-lg text-white flex items-center justify-center gap-1.5">
              <span>بوصلة اتجاه القبلة</span>
              <span>🧭</span>
            </h2>
            <p className="text-[11px] text-amber-300/80 font-serif">
              وجهة الكعبة المشرفة بمكة المكرمة 🕋
            </p>
          </div>

          <div className="w-5" />
        </div>

        {/* 2. Location & Angle Stats Box */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
          <div className="px-3 py-1.5 rounded-xl bg-teal-700/80 border border-teal-400/50 text-white font-mono text-xs font-bold shadow-sm">
            {qiblaAngle}° من الشمال
          </div>

          <div className="text-left">
            <div className="font-bold text-sm text-white">{cityName} ▪ {countryName}</div>
            <div className="text-[10px] text-emerald-300/70 font-mono mt-0.5">
              المسافة إلى مكة: ~{distanceKm.toLocaleString('ar-EG')} كم
            </div>
          </div>
        </div>

        {/* 3. Concentric Radar Graphic Display */}
        <div className="relative my-4 flex items-center justify-center">
          <div
            className={`relative w-64 h-64 rounded-full border-2 transition-all duration-500 bg-gradient-to-b from-[#082019] to-[#04100c] flex items-center justify-center shadow-inner overflow-hidden ${
              isAligned
                ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                : 'border-emerald-600/40'
            }`}
          >
            {/* Concentric rings */}
            <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-10 rounded-full border border-emerald-500/25" />
            <div className="absolute inset-16 rounded-full border border-emerald-500/30" />

            {/* Radar Crosshair lines */}
            <div className="absolute inset-x-0 h-px bg-emerald-500/20" />
            <div className="absolute inset-y-0 w-px bg-emerald-500/20" />

            {/* Rotating Needle pointing towards Qibla */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${relativeAngle}deg)` }}
            >
              {/* Gold Triangle Arrow pointing to Kaaba */}
              <div className="flex flex-col items-center justify-start h-full pt-4">
                <div
                  className={`w-8 h-8 rounded-lg bg-black border transition-all flex items-center justify-center mb-1 ${
                    isAligned
                      ? 'border-amber-300 scale-125 shadow-[0_0_20px_#f59e0b]'
                      : 'border-amber-400 shadow-lg shadow-amber-400/50'
                  }`}
                >
                  <span className="text-base">🕋</span>
                </div>
                <div
                  className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[45px] border-b-amber-400/90"
                />
              </div>
            </div>

            {/* Center Bearing text */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#0a1e17] border border-emerald-400/50 flex items-center justify-center text-center shadow-md">
              <span className="font-mono font-black text-sm text-white">
                {Math.round(effectiveHeading)}°
              </span>
            </div>
          </div>
        </div>

        {/* Manual Slider if sensor is not available */}
        {!hasSensor && (
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="359"
              value={manualSlider}
              onChange={(e) => setManualSlider(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-black/40 rounded-lg"
            />
          </div>
        )}

        {/* 4. Bottom Hint Box */}
        <div
          className={`p-3 rounded-2xl border text-center flex items-center justify-center gap-2 text-xs transition-all ${
            isAligned
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
              : 'bg-black/40 border-emerald-500/20 text-emerald-200'
          }`}
        >
          <span>{isAligned ? 'أنت الآن في اتجاه القبلة المشرفة بالضبط! 🕋' : 'قم بتدوير الهاتف حتى تتطابق إبرة الكعبة الذهبية للأعلى'}</span>
          <span>{isAligned ? '✨' : '🧭'}</span>
        </div>

        {/* 5. Big Bottom Button */}
        <button
          onClick={onClose}
          style={{
            background: 'var(--accent-gradient)',
            color: 'var(--accent-text)',
            boxShadow: '0 8px 25px -4px var(--accent-glow)',
          }}
          className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <span>تم وحفظ الاتجاه</span>
          <span>✅</span>
        </button>
      </div>
    </div>
  );
};
