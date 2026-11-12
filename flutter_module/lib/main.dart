import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() => runApp(const HaqqAllahFlutterApp());

class HaqqAllahFlutterApp extends StatelessWidget {
  const HaqqAllahFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'حق الله - المصحف الشريف',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Amiri',
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0C3127)),
        useMaterial3: true,
      ),
      home: const QuranReaderFlutterScreen(),
    );
  }
}

enum MushafThemeMode { oledBlack, whiteDay, sepiaVintage }

class QuranReaderFlutterScreen extends StatefulWidget {
  const QuranReaderFlutterScreen({super.key});

  @override
  State<QuranReaderFlutterScreen> createState() => _QuranReaderFlutterScreenState();
}

class _QuranReaderFlutterScreenState extends State<QuranReaderFlutterScreen> {
  MushafThemeMode _currentTheme = MushafThemeMode.oledBlack;
  bool _isImmersive = false;
  int _currentPage = 1;
  final int _totalPages = 604;
  bool _isPlayingAudio = false;

  void _toggleImmersive() {
    setState(() {
      _isImmersive = !_isImmersive;
    });

    if (_isImmersive) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }

  Color get _backgroundColor {
    switch (_currentTheme) {
      case MushafThemeMode.oledBlack:
        return Colors.black;
      case MushafThemeMode.whiteDay:
        return Colors.white;
      case MushafThemeMode.sepiaVintage:
        return const Color(0xFFFBF0D9);
    }
  }

  Color get _textColor {
    switch (_currentTheme) {
      case MushafThemeMode.oledBlack:
        return const Color(0xFFF1F5F9);
      case MushafThemeMode.whiteDay:
        return const Color(0xFF0F172A);
      case MushafThemeMode.sepiaVintage:
        return const Color(0xFF422006);
    }
  }

  Color get _ornamentColor {
    switch (_currentTheme) {
      case MushafThemeMode.oledBlack:
        return const Color(0xFFFBBF24);
      case MushafThemeMode.whiteDay:
        return const Color(0xFF047857);
      case MushafThemeMode.sepiaVintage:
        return const Color(0xFF92400E);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: _backgroundColor,
        body: GestureDetector(
          onTap: _toggleImmersive,
          behavior: HitTestBehavior.opaque,
          child: SafeArea(
            top: !_isImmersive,
            bottom: !_isImmersive,
            child: Stack(
              children: [
                // 1. Center Mushaf Content
                Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Surah Header Ornament
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 24),
                          decoration: BoxDecoration(
                            border: Border.all(color: _ornamentColor.withOpacity(0.4), width: 1.5),
                            borderRadius: BorderRadius.circular(16),
                            color: _ornamentColor.withOpacity(0.08),
                          ),
                          child: Text(
                            'سُورَةُ الفَاتِحَةِ',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: _ornamentColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Basmalah
                        Text(
                          'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w600,
                            color: _textColor,
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Ayahs
                        Text(
                          'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 22,
                            height: 2.2,
                            color: _textColor,
                          ),
                        ),
                        const SizedBox(height: 48),
                        // Page Number Badge
                        Text(
                          'الصفحة $_currentPage من $_totalPages',
                          style: TextStyle(
                            fontSize: 12,
                            color: _textColor.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // 2. Top Bar (Hides in Immersive Mode)
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 250),
                  top: _isImmersive ? -80 : 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: _backgroundColor.withOpacity(0.92),
                      border: Border(bottom: BorderSide(color: _ornamentColor.withOpacity(0.2))),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'المصحف الشريف (V2.8 Flutter)',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _textColor,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: Icon(
                                _currentTheme == MushafThemeMode.oledBlack
                                    ? Icons.dark_mode
                                    : (_currentTheme == MushafThemeMode.sepiaVintage
                                        ? Icons.menu_book
                                        : Icons.light_mode),
                                color: _ornamentColor,
                              ),
                              onPressed: () {
                                setState(() {
                                  if (_currentTheme == MushafThemeMode.oledBlack) {
                                    _currentTheme = MushafThemeMode.sepiaVintage;
                                  } else if (_currentTheme == MushafThemeMode.sepiaVintage) {
                                    _currentTheme = MushafThemeMode.whiteDay;
                                  } else {
                                    _currentTheme = MushafThemeMode.oledBlack;
                                  }
                                });
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // 3. Bottom Floating Audio Control Pill
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 250),
                  bottom: _isImmersive ? -90 : 20,
                  left: 20,
                  right: 20,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C3127),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: const Color(0xFFFBBF24), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.4),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.skip_next, color: Colors.white70),
                          onPressed: () {},
                        ),
                        IconButton(
                          icon: Icon(
                            _isPlayingAudio ? Icons.pause_circle_filled : Icons.play_circle_filled,
                            color: const Color(0xFFFBBF24),
                            size: 36,
                          ),
                          onPressed: () {
                            setState(() {
                              _isPlayingAudio = !_isPlayingAudio;
                            });
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.skip_previous, color: Colors.white70),
                          onPressed: () {},
                        ),
                        const Text(
                          'تلاوة الشيخ المنشاوي',
                          style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
