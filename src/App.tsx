import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckSquare,
  BookOpen,
  Sliders
} from 'lucide-react';
import {
  CityLocation,
  DailyPrayerRecord,
  HaqqAllahTabType,
  LockdownStepType,
  MissedReason,
  PrayerName,
  UserPreferences,
  ZikrItem
} from './types';
import {
  getTodayDateStr,
  loadAzkarItems,
  loadDailyRecord,
  loadUserPreferences,
  saveAzkarItems,
  saveDailyRecord,
  saveUserPreferences
} from './services/storageService';
import { PrayerTimesScreen } from './screens/PrayerTimesScreen';
import { TrackerScreen } from './screens/TrackerScreen';
import { AzkarScreen } from './screens/AzkarScreen';
import { QuranReaderScreen } from './screens/QuranReaderScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LockScreenModal } from './components/LockScreenModal';
import { ReleasesDownloadModal } from './components/ReleasesDownloadModal';
import { UpdateNotificationModal } from './components/UpdateNotificationModal';
import { DownloadDistributionPage } from './components/DownloadDistributionPage';
import { PREDEFINED_CITIES } from './data/islamicData';
import { calculatePrayerTimes } from './services/prayerCalculator';
import { audioService } from './services/audioService';
import {
  checkForAppUpdates,
  getLastUpdateCheckTimestamp,
  isOptionalUpdateDismissed,
} from './services/updateService';
import { UpdateCheckResult } from './types/update';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [currentTab, setCurrentTab] = useState<HaqqAllahTabType>('prayers');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => getTodayDateStr());
  const [dailyRecord, setDailyRecord] = useState<DailyPrayerRecord>(() => loadDailyRecord(getTodayDateStr()));
  const [azkarItems, setAzkarItems] = useState<ZikrItem[]>(() => loadAzkarItems());
  const [selectedAzkarCat, setSelectedAzkarCat] = useState<string>('morning');
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [isReleasesModalOpen, setIsReleasesModalOpen] = useState<boolean>(false);
  const [isStandaloneDownloadView, setIsStandaloneDownloadView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/download' ||
      new URLSearchParams(window.location.search).get('view') === 'download'
    );
  });
  const [availableUpdate, setAvailableUpdate] = useState<UpdateCheckResult | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  // Lockdown modal state
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(false);
  const [lockdownPrayerType, setLockdownPrayerType] = useState<PrayerName>('MAGHRIB');
  const [lockdownStep, setLockdownStep] = useState<LockdownStepType>('QUESTION_PRAYED');
  const [selectedReason, setSelectedReason] = useState<MissedReason | null>(null);

  // Update preferences & save
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);
  };

  // Change date in tracker
  const handleChangeDate = (newDateStr: string) => {
    setSelectedDateStr(newDateStr);
    const rec = loadDailyRecord(newDateStr);
    setDailyRecord(rec);
  };

  // Update daily record & save
  const handleUpdateDailyRecord = (newRec: DailyPrayerRecord) => {
    setDailyRecord(newRec);
    saveDailyRecord(newRec);
  };

  // Update azkar & save
  const handleUpdateAzkarItems = (newItems: ZikrItem[]) => {
    setAzkarItems(newItems);
    saveAzkarItems(newItems);
  };

  // GPS Geolocation Handler
  const handleDetectGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      alert('خدمة تحديد الموقع (GPS) غير مدعومة في متصفحك');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const tzOffset = -new Date().getTimezoneOffset() / 60;

        let nearestCity = PREDEFINED_CITIES[0];
        let minDistance = Number.MAX_VALUE;

        PREDEFINED_CITIES.forEach((c) => {
          const d = Math.hypot(Number(c.latitude) - lat, Number(c.longitude) - lon);
          if (d < minDistance) {
            minDistance = d;
            nearestCity = c;
          }
        });

        const updatedCity: CityLocation = {
          cityNameAr: minDistance < 0.5 ? nearestCity.cityNameAr : 'موقعي الحالي',
          cityNameEn: minDistance < 0.5 ? nearestCity.cityNameEn : 'My Current Location',
          countryNameAr: nearestCity.countryNameAr,
          latitude: lat,
          longitude: lon,
          timezoneOffsetHours: tzOffset,
          defaultMethod: preferences.calculationMethod,
        };

        handleUpdatePreferences({
          ...preferences,
          selectedCity: updatedCity,
        });
        setIsGpsLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsGpsLoading(false);
        alert('تعذر تحديد الموقع الجغرافي. يرجى التأكد من منح صلاحية الموقع.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [preferences]);

  // Lockdown modal handlers
  const triggerLockdown = (prayer: PrayerName) => {
    setLockdownPrayerType(prayer);
    setLockdownStep('QUESTION_PRAYED');
    setSelectedReason(null);
    setIsLockdownActive(true);
  };

  const handleYesPrayed = () => {
    const updated = {
      ...dailyRecord,
      prayerStatuses: {
        ...dailyRecord.prayerStatuses,
        [lockdownPrayerType]: 'on_time' as const,
      },
    };
    handleUpdateDailyRecord(updated);
    setLockdownStep('COMPLETED_BLESSING');
  };

  const handleNoNotPrayed = () => {
    setLockdownStep('QUESTION_REASON');
  };

  const handleSelectReason = (reason: MissedReason) => {
    setSelectedReason(reason);
    setLockdownStep('GUIDANCE_ADVICE');
  };

  const handleConfirmPrayedNow = () => {
    const updated = {
      ...dailyRecord,
      prayerStatuses: {
        ...dailyRecord.prayerStatuses,
        [lockdownPrayerType]: 'on_time' as const,
      },
    };
    handleUpdateDailyRecord(updated);
    setLockdownStep('COMPLETED_BLESSING');
  };

  const handleEmergencySnooze = () => {
    setIsLockdownActive(false);
  };

  const handleOpenAfterPrayerAzkar = () => {
    setIsLockdownActive(false);
    setCurrentTab('azkar');
    setSelectedAzkarCat('after_prayer');
  };

  // Periodic prayer checker for auto Adhan and Lockdown Screen
  const lastTriggeredMinuteRef = React.useRef<string>('');

  useEffect(() => {
    const checkPrayerTimes = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const timeKey = `${now.toDateString()}_${currentHours}:${currentMinutes}`;

      if (lastTriggeredMinuteRef.current === timeKey) return;

      const opts = {
        latitude: preferences.selectedCity.latitude,
        longitude: preferences.selectedCity.longitude,
        timezoneOffsetHours: preferences.selectedCity.timezoneOffsetHours,
        isDaylightSaving: preferences.isDaylightSaving,
        manualOffsetMinutes: preferences.manualOffsetMinutes,
        methodId: preferences.calculationMethod,
        madhab: preferences.madhab,
      };

      const prayerTimes = calculatePrayerTimes(now, opts);

      for (const p of prayerTimes) {
        if (p.type === 'SUNRISE') continue;
        const pDate = new Date(p.timestamp);
        const pHours = pDate.getHours();
        const pMinutes = pDate.getMinutes();

        if (currentHours === pHours && currentMinutes === pMinutes) {
          lastTriggeredMinuteRef.current = timeKey;
          const isEnabled = preferences.adhanEnabledPrayers?.[p.type] ?? true;

          if (isEnabled) {
            audioService.playAdhan(p.type);
            triggerLockdown(p.type);

            // Native notification if permitted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`حان الآن موعد صلاة ${p.arabicName}`, {
                  body: 'حي على الصلاة.. حي على الفلاح (حق الله V2.7)',
                  icon: '/favicon.ico',
                  tag: 'adhan-alert',
                });
              } catch {}
            }
          }
          break;
        }
      }
    };

    const interval = setInterval(checkPrayerTimes, 1000);
    return () => clearInterval(interval);
  }, [preferences]);

  // Continuous Update System: check on launch, periodically every 6h, and on foreground resume
  const runUpdateCheck = useCallback(async (manual = false) => {
    try {
      const result = await checkForAppUpdates();
      if (result.updateAvailable) {
        setAvailableUpdate(result);
        if (manual || result.mandatoryUpdate || !isOptionalUpdateDismissed(result.latestVersionCode)) {
          setIsUpdateModalOpen(true);
        }
      } else if (manual) {
        setAvailableUpdate(result);
      }
      return result;
    } catch (err) {
      console.warn('Update check failed:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const startupTimer = setTimeout(() => {
      void runUpdateCheck(false);
    }, 1200);

    const periodicTimer = setInterval(() => {
      void runUpdateCheck(false);
    }, 6 * 60 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - getLastUpdateCheckTimestamp();
        if (elapsed > 60 * 60 * 1000) {
          void runUpdateCheck(false);
        }
      }
    };

    const handleOpenDownloadEvent = () => {
      setIsStandaloneDownloadView(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('haqqallah:open-download', handleOpenDownloadEvent);

    return () => {
      clearTimeout(startupTimer);
      clearInterval(periodicTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('haqqallah:open-download', handleOpenDownloadEvent);
    };
  }, [runUpdateCheck]);

  const openDownloadPage = () => {
    setIsReleasesModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsStandaloneDownloadView(true);
    if (typeof window !== 'undefined' && window.location.pathname !== '/download') {
      window.history.pushState({}, '', '/download');
    }
  };

  const closeDownloadPage = () => {
    setIsStandaloneDownloadView(false);
    if (typeof window !== 'undefined' && window.location.pathname === '/download') {
      window.history.pushState({}, '', '/');
    }
  };

  // Determine active theme class - preserves full theme preset richness
  const getEffectiveThemeClass = () => {
    if (preferences.themeMode === 'light' || preferences.themePreset === 'light') return 'theme-light';
    return `theme-${preferences.themePreset || 'oled'}`;
  };

  const fontScaleFactor = (parseInt(preferences.fontScaleLevel || '100', 10) || 100) / 100;

  return (
    <div
      className={`min-h-screen ${getEffectiveThemeClass()} islamic-pattern-bg font-sans antialiased selection:bg-amber-500 selection:text-black transition-colors duration-400`}
      data-accent={preferences.accentColorPreset || 'mint'}
      style={{ fontSize: `${fontScaleFactor}rem` }}
      dir="rtl"
    >
      {/* Centered Mobile App Frame */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-8 min-h-screen flex flex-col justify-between">
        {/* Dynamic Screen View */}
        <main className="flex-1">
          {isStandaloneDownloadView ? (
            <DownloadDistributionPage
              onBackToApp={closeDownloadPage}
              onOpenUpdateModal={(res) => {
                setAvailableUpdate(res);
                setIsUpdateModalOpen(true);
              }}
            />
          ) : (
            <>
              {currentTab === 'prayers' && (
                <PrayerTimesScreen
                  preferences={preferences}
                  dailyRecord={dailyRecord}
                  onUpdateDailyRecord={handleUpdateDailyRecord}
                  onNavigateToTab={setCurrentTab}
                  onTriggerLockdown={triggerLockdown}
                  onDetectGps={handleDetectGps}
                  isGpsLoading={isGpsLoading}
                  onOpenReleasesModal={() => setIsReleasesModalOpen(true)}
                />
              )}

              {currentTab === 'tracker' && (
                <TrackerScreen
                  currentRecord={dailyRecord}
                  onUpdateRecord={handleUpdateDailyRecord}
                  selectedDateStr={selectedDateStr}
                  onChangeDate={handleChangeDate}
                />
              )}

              {currentTab === 'azkar' && (
                <AzkarScreen
                  azkarItems={azkarItems}
                  onUpdateAzkarItems={handleUpdateAzkarItems}
                  selectedCategory={selectedAzkarCat}
                  onSelectCategory={setSelectedAzkarCat}
                  preferences={preferences}
                  onUpdatePreferences={handleUpdatePreferences}
                />
              )}

              {currentTab === 'quran' && (
                <QuranReaderScreen
                  preferences={preferences}
                  onUpdatePreferences={handleUpdatePreferences}
                  onBackToPrayers={() => setCurrentTab('prayers')}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsScreen
                  preferences={preferences}
                  onUpdatePreferences={handleUpdatePreferences}
                  onDetectGps={handleDetectGps}
                  isGpsLoading={isGpsLoading}
                  onOpenReleasesModal={openDownloadPage}
                  onCheckForUpdates={() => runUpdateCheck(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Floating Navigation Dock (Hidden in Quran Reader and Standalone Download View) */}
        {currentTab !== 'quran' && !isStandaloneDownloadView && (
          <nav className="fixed bottom-2 left-3 right-3 max-w-md mx-auto z-40 backdrop-blur-2xl border rounded-3xl p-1.5 shadow-2xl flex items-center justify-around transition-all">
            {[
              { id: 'prayers' as const, label: 'المواقيت', icon: Clock },
              { id: 'tracker' as const, label: 'المتابعة', icon: CheckSquare },
              { id: 'azkar' as const, label: 'الأذكار', icon: BookOpen },
              { id: 'settings' as const, label: 'الإعدادات', icon: Sliders },
            ].map((tab) => {
              const isSelected = currentTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  style={isSelected ? { color: 'var(--accent-color)' } : undefined}
                  className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${
                    isSelected
                      ? 'font-bold scale-105'
                      : 'text-emerald-300/60 hover:text-emerald-200'
                  }`}
                >
                  {/* Subtle active luminous pill */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-20 -z-10 transition-all duration-300"
                      style={{ backgroundColor: 'var(--accent-color)', boxShadow: '0 0 20px var(--accent-glow)' }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5 mb-0.5 transition-transform ${isSelected ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`}
                    style={isSelected ? { color: 'var(--accent-color)' } : undefined}
                  />
                  <span className="text-[11px] font-serif tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Interactive Haqq Allah Prayer Lockdown Modal */}
      {isLockdownActive && (
        <LockScreenModal
          prayerType={lockdownPrayerType}
          currentStep={lockdownStep}
          selectedReason={selectedReason}
          onYesPrayed={handleYesPrayed}
          onNoNotPrayed={handleNoNotPrayed}
          onSelectReason={handleSelectReason}
          onConfirmPrayedNow={handleConfirmPrayedNow}
          onDismiss={() => setIsLockdownActive(false)}
          onEmergencySnooze={handleEmergencySnooze}
          onOpenAfterPrayerAzkar={handleOpenAfterPrayerAzkar}
        />
      )}

      {/* Official Releases & APK Download Hub Modal */}
      <ReleasesDownloadModal
        isOpen={isReleasesModalOpen}
        onClose={() => setIsReleasesModalOpen(false)}
        onOpenUpdateModal={(res) => {
          setAvailableUpdate(res);
          setIsUpdateModalOpen(true);
        }}
      />

      {/* Automatic & Manual Update Notification Modal */}
      <UpdateNotificationModal
        isOpen={isUpdateModalOpen}
        updateResult={availableUpdate}
        onClose={() => setIsUpdateModalOpen(false)}
        onOpenDownloadPage={openDownloadPage}
      />
    </div>
  );
}
