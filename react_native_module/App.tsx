import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Vibration,
  I18nManager
} from 'react-native';

// Force RTL layout
I18nManager.forceRTL(true);

interface ZikrItem {
  id: string;
  arabicText: string;
  targetCount: number;
  reward: string;
}

const AZKAR_DATA: ZikrItem[] = [
  {
    id: 'subhanallah',
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    targetCount: 100,
    reward: 'حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ'
  },
  {
    id: 'astaghfirullah',
    arabicText: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    targetCount: 100,
    reward: 'مَن لزم الاستغفار جعل الله له من كل همٍّ فرجاً'
  },
  {
    id: 'tahlil',
    arabicText: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    targetCount: 10,
    reward: 'كانت له عدل أربع رقاب من ولد إسماعيل'
  },
  {
    id: 'salawat',
    arabicText: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    targetCount: 10,
    reward: 'من صلى عليَّ صلاة صلى الله عليه بها عشراً'
  }
];

export default function App() {
  const [selectedZikr, setSelectedZikr] = useState<ZikrItem>(AZKAR_DATA[0]);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);

  const handleIncrement = () => {
    Vibration.vibrate(25);
    const nextCount = currentCount + 1;
    if (nextCount >= selectedZikr.targetCount) {
      setCurrentCount(0);
      setTotalCompleted(prev => prev + 1);
      Vibration.vibrate([0, 80, 80, 120]);
    } else {
      setCurrentCount(nextCount);
    }
  };

  const handleReset = () => {
    setCurrentCount(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#061914" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المسبحة والأذكار (React Native V2.8)</Text>
        <Text style={styles.headerSubtitle}>حق الله • عداد الذكر والاستغفار</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Counter Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleIncrement}
          style={styles.counterCard}
        >
          <Text style={styles.zikrText}>{selectedZikr.arabicText}</Text>
          <Text style={styles.rewardText}>{selectedZikr.reward}</Text>

          {/* Interactive Luminous Counter Ring */}
          <View style={styles.counterRing}>
            <Text style={styles.counterNumber}>{currentCount}</Text>
            <Text style={styles.targetLabel}>من {selectedZikr.targetCount}</Text>
          </View>

          <Text style={styles.tapHint}>اضغط في أي مكان للتسبيح 👆</Text>
        </TouchableOpacity>

        {/* Counter Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>إعادة ضبط ↺</Text>
          </TouchableOpacity>
          <View style={styles.statsBadge}>
            <Text style={styles.statsText}>الإجمالي: {totalCompleted} ختمة</Text>
          </View>
        </View>

        {/* Zikr Selector List */}
        <Text style={styles.sectionTitle}>اختر الذكر:</Text>
        {AZKAR_DATA.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              setSelectedZikr(item);
              setCurrentCount(0);
            }}
            style={[
              styles.zikrItemButton,
              selectedZikr.id === item.id && styles.zikrItemButtonActive
            ]}
          >
            <Text
              style={[
                styles.zikrItemText,
                selectedZikr.id === item.id && styles.zikrItemTextActive
              ]}
            >
              {item.arabicText}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061914',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.15)',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(110, 231, 183, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  counterCard: {
    backgroundColor: '#0C3127',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    alignItems: 'center',
    marginBottom: 16,
  },
  zikrText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },
  rewardText: {
    color: 'rgba(251, 191, 36, 0.85)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  counterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#061914',
    borderWidth: 4,
    borderColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  counterNumber: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  targetLabel: {
    color: 'rgba(110, 231, 183, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  tapHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginTop: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  resetButtonText: {
    color: '#F87171',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statsText: {
    color: '#6EE7B7',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  zikrItemButton: {
    backgroundColor: 'rgba(12, 49, 39, 0.6)',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    marginBottom: 8,
  },
  zikrItemButtonActive: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  zikrItemText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
  },
  zikrItemTextActive: {
    color: '#FBBF24',
    fontWeight: 'bold',
  },
});
