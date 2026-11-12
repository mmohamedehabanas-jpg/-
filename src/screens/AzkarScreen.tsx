import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Bell,
  Sparkles,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserPreferences, ZikrItem } from '../types';
import { AZKAR_CATEGORIES } from '../data/islamicData';
import { audioService } from '../services/audioService';

interface AzkarScreenProps {
  azkarItems: ZikrItem[];
  onUpdateAzkarItems: (items: ZikrItem[]) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const AzkarScreen: React.FC<AzkarScreenProps> = ({
  azkarItems,
  onUpdateAzkarItems,
  selectedCategory,
  onSelectCategory,
  preferences,
  onUpdatePreferences,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ZikrItem | null>(null);
  const [newZikrText, setNewZikrText] = useState<string>('');
  const [newZikrCount, setNewZikrCount] = useState<number>(3);
  const [newZikrVirtue, setNewZikrVirtue] = useState<string>('');
  const [newZikrSource, setNewZikrSource] = useState<string>('مأثور وثابت');

  // Increment item repetition
  const handleItemClick = (id: number) => {
    const updated = azkarItems.map((item) => {
      if (item.id === id) {
        const next = Math.min(item.targetCount, item.currentCount + 1);
        if (next === item.targetCount && item.currentCount < item.targetCount) {
          audioService.playZikrCompleted();
          try {
            confetti({
              particleCount: 45,
              spread: 50,
              origin: { y: 0.7 },
              colors: ['#fbbf24', '#10b981', '#34d399']
            });
          } catch {}
        } else {
          audioService.playTasbeehClick();
        }
        return { ...item, currentCount: next };
      }
      return item;
    });
    onUpdateAzkarItems(updated);
  };

  const handleResetSingleItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = azkarItems.map((item) => (item.id === id ? { ...item, currentCount: 0 } : item));
    onUpdateAzkarItems(updated);
  };

  const resetAllCategoryProgress = () => {
    const updated = azkarItems.map((item) => {
      if (item.category === selectedCategory) {
        return { ...item, currentCount: 0 };
      }
      return item;
    });
    onUpdateAzkarItems(updated);
  };

  const handleDeleteItem = (id: number) => {
    onUpdateAzkarItems(azkarItems.filter((i) => i.id !== id));
  };

  const handleSaveZikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZikrText.trim()) return;

    if (editingItem) {
      const updated = azkarItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              text: newZikrText.trim(),
              targetCount: newZikrCount,
              virtue: newZikrVirtue.trim(),
              source: newZikrSource.trim(),
            }
          : item
      );
      onUpdateAzkarItems(updated);
      setEditingItem(null);
    } else {
      const newItem: ZikrItem = {
        id: Date.now(),
        text: newZikrText.trim(),
        targetCount: Math.max(1, newZikrCount),
        currentCount: 0,
        virtue: newZikrVirtue.trim() || 'ذكر مبارك مأثور',
        source: newZikrSource.trim() || 'مأثور وثابت',
        category: selectedCategory,
        isCustom: true,
      };
      onUpdateAzkarItems([newItem, ...azkarItems]);
    }

    setNewZikrText('');
    setNewZikrVirtue('');
    setShowAddModal(false);
  };

  const openEditModal = (item: ZikrItem) => {
    setEditingItem(item);
    setNewZikrText(item.text);
    setNewZikrCount(item.targetCount);
    setNewZikrVirtue(item.virtue || '');
    setNewZikrSource(item.source || 'مأثور وثابت');
    setShowAddModal(true);
  };

  const sanitizeZikrText = (raw: string): string => {
    return raw
      .replace(/\\n/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/[{}]/g, '')
      .trim();
  };

  const filteredItems = azkarItems.filter((i) => i.category === selectedCategory);
  const completedCount = filteredItems.filter((i) => i.currentCount >= i.targetCount).length;

  return (
    <div className="space-y-4 pb-28 text-white select-none" dir="rtl">
      {/* 1. Top Header: Badge on left, Title on right */}
      <div className="flex items-center justify-between pt-1 pb-1">
        {/* Left: Counter Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#122822] border border-emerald-500/30 text-emerald-200 text-xs font-mono font-bold shadow-sm">
          <span>{completedCount}</span>
          <span className="text-sm">📿</span>
        </div>

        {/* Right: Title & Hadith */}
        <div className="text-right">
          <h1 className="font-serif font-black text-xl text-white">
            أذكار المسلم وحصنه
          </h1>
          <p className="text-xs text-emerald-300/80 font-serif mt-0.5">
            «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
          </p>
        </div>
      </div>

      {/* 2. Action Buttons: استعادة المأثور & + إضافة ذكر جديد */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetAllCategoryProgress}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-[#0b241e] hover:bg-[#103028] border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>استعادة المأثور</span>
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        </button>

        <button
          onClick={() => {
            setEditingItem(null);
            setNewZikrText('');
            setNewZikrCount(3);
            setNewZikrVirtue('');
            setShowAddModal(true);
          }}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة ذكر جديد</span>
        </button>
      </div>

      {/* 3. Card: التنبيهات الموقوتة للأذكار 🔔 */}
      <div className="p-4 rounded-3xl bg-[#091f18]/90 border border-emerald-500/20 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif font-black text-base text-white">
              التنبيهات الموقوتة للأذكار
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              إشعارات هادئة في الأوقات المأثورة المحددة
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-center text-amber-300 text-lg">
            🔔
          </div>
        </div>

        {/* 3 Timed Toggles */}
        <div className="space-y-2.5 pt-1">
          {/* Morning */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
            {/* Toggle switch */}
            <button
              onClick={() =>
                onUpdatePreferences({
                  ...preferences,
                  isMorningAzkarReminder: !preferences.isMorningAzkarReminder,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                preferences.isMorningAzkarReminder ? 'bg-amber-400' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.isMorningAzkarReminder ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                }`}
              />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="font-bold text-xs text-white block">أذكار الصباح</span>
                <span className="text-[10px] text-emerald-300/70 font-mono">
                  الموعد: {preferences.morningReminderTime || '06:30 ص'}
                </span>
              </div>
              <span className="text-xl">🌅</span>
            </div>
          </div>

          {/* Evening */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
            <button
              onClick={() =>
                onUpdatePreferences({
                  ...preferences,
                  isEveningAzkarReminder: !preferences.isEveningAzkarReminder,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                preferences.isEveningAzkarReminder ? 'bg-amber-400' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.isEveningAzkarReminder ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                }`}
              />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="font-bold text-xs text-white block">أذكار المساء</span>
                <span className="text-[10px] text-emerald-300/70 font-mono">
                  الموعد: {preferences.eveningReminderTime || '04:45 م'}
                </span>
              </div>
              <span className="text-xl">🌇</span>
            </div>
          </div>

          {/* Sleep */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-emerald-500/10">
            <button
              onClick={() =>
                onUpdatePreferences({
                  ...preferences,
                  isSleepAzkarReminder: !preferences.isSleepAzkarReminder,
                })
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                preferences.isSleepAzkarReminder ? 'bg-amber-400' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  preferences.isSleepAzkarReminder ? 'translate-x-[-26px]' : 'translate-x-[-2px]'
                }`}
              />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="font-bold text-xs text-white block">أذكار النوم</span>
                <span className="text-[10px] text-emerald-300/70 font-mono">
                  الموعد: {preferences.sleepReminderTime || '11:00 م'}
                </span>
              </div>
              <span className="text-xl">🌙</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Horizontal Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'morning', title: 'أذكار الصباح', icon: '🌅' },
          { id: 'evening', title: 'أذكار المساء', icon: '🌇' },
          { id: 'sleep', title: 'أذكار النوم', icon: '🌙' },
          { id: 'after_prayer', title: 'بعد الصلاة', icon: '🕌' },
          { id: 'tasbeeh', title: 'مسبحة حق الله', icon: '📿' },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--accent-color)',
                      borderColor: 'var(--accent-border)',
                      color: 'var(--accent-text)',
                    }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                isSelected
                  ? 'shadow-md font-black'
                  : 'bg-[#091f18] text-emerald-200 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Zikr Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isDone = item.currentCount >= item.targetCount;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all space-y-3 ${
                isDone
                  ? 'bg-[#091f18] border-2 border-emerald-400/90 shadow-lg shadow-emerald-950/40'
                  : 'bg-[#091f18]/90 border border-amber-400/40 shadow-md'
              }`}
            >
              {/* Card Header: Actions on left, Title on right */}
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-emerald-300 hover:text-amber-300"
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-300/90 font-serif">
                  <span>مأثور وثابت</span>
                  <span>📜</span>
                </div>
              </div>

              {/* Quranic / Supplication Text with Tashkeel in Brackets (Sanitized) */}
              <p className="text-base font-serif text-white leading-loose text-justify font-normal select-text whitespace-pre-line">
                {`{${sanitizeZikrText(item.text)}}`}
              </p>

              {/* Shaded Virtue Box */}
              {item.virtue && (
                <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs text-emerald-200/90 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-400">🌌</span>
                    <span className="leading-relaxed">{item.virtue}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/60 font-mono">
                    المصدر: {item.source}
                  </div>
                </div>
              )}

              {/* Bottom Action Button & Reset */}
              <div className="flex items-center gap-2 pt-1">
                {/* Reset button ↺ */}
                <button
                  onClick={(e) => handleResetSingleItem(item.id, e)}
                  className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-emerald-500/20 text-emerald-300"
                  title="تصفير هذا الذكر"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Main counter button */}
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                      : 'bg-[#154a3c] hover:bg-[#1a5b4a] text-white border border-emerald-400/40'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>تم بحمد الله ({item.targetCount}/{item.targetCount})</span>
                    </>
                  ) : (
                    <span>اضغط للتسبيح: {item.currentCount} / {item.targetCount}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Zikr Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0c241e] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="font-bold text-base text-amber-300 font-serif">
                {editingItem ? 'تعديل الذكر' : 'إضافة ذكر جديد'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full bg-white/5 text-emerald-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveZikr} className="space-y-3.5">
              <div>
                <label className="text-xs text-emerald-300 block mb-1">نص الذكر أو الدعاء:</label>
                <textarea
                  required
                  rows={3}
                  value={newZikrText}
                  onChange={(e) => setNewZikrText(e.target.value)}
                  placeholder="اكتب الذكر أو الدعاء..."
                  className="w-full p-3 rounded-2xl bg-black/40 border border-emerald-500/30 text-white text-xs placeholder:text-emerald-400/40 focus:outline-none focus:border-amber-400 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-emerald-300 block mb-1">عدد التكرار:</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newZikrCount}
                    onChange={(e) => setNewZikrCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-300 block mb-1">المصدر:</label>
                  <input
                    type="text"
                    value={newZikrSource}
                    onChange={(e) => setNewZikrSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-emerald-300 block mb-1">الفضل والبركة:</label>
                <input
                  type="text"
                  value={newZikrVirtue}
                  onChange={(e) => setNewZikrVirtue(e.target.value)}
                  placeholder="فضل الذكر..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-black text-xs shadow-md"
                >
                  حفظ الذكر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
