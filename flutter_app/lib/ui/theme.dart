import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ألوان FORMA من index.html
class FC {
  static const accentL = Color(0xFF0E7A5A), accentD = Color(0xFF3DCB95);
  static const bgL = Color(0xFFF1F3F1), bgD = Color(0xFF0B0F0E);
  static const surfL = Color(0xFFFFFFFF), surfD = Color(0xFF141A18);
  static const inkL = Color(0xFF0F1513), inkD = Color(0xFFE9EFEC);
  static const mutedL = Color(0xFF5E6B66), mutedD = Color(0xFF8E9C96);
  static const protein = Color(0xFFD9534F), carb = Color(0xFFE0A030), fat = Color(0xFF4A90D9);
}

ThemeData formaTheme(Brightness b) {
  final dark = b == Brightness.dark;
  final scheme = ColorScheme.fromSeed(
    seedColor: dark ? FC.accentD : FC.accentL,
    brightness: b,
    primary: dark ? FC.accentD : FC.accentL,
    surface: dark ? FC.surfD : FC.surfL,
  );
  final base = ThemeData(useMaterial3: true, colorScheme: scheme, brightness: b);
  final text = GoogleFonts.almaraiTextTheme(base.textTheme).apply(
    bodyColor: dark ? FC.inkD : FC.inkL,
    displayColor: dark ? FC.inkD : FC.inkL,
  );
  return base.copyWith(
    scaffoldBackgroundColor: dark ? FC.bgD : FC.bgL,
    textTheme: text,
    cardTheme: CardThemeData(
      color: dark ? FC.surfD : FC.surfL,
      elevation: 0,
      margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: dark ? const Color(0xFF1A211F) : const Color(0xFFF7F9F8),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: GoogleFonts.almarai(fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
  );
}

Color muted(BuildContext c) => Theme.of(c).brightness == Brightness.dark ? FC.mutedD : FC.mutedL;

String fmt(num n) {
  final v = n.round();
  final s = v.abs().toString();
  final b = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
    b.write(s[i]);
  }
  return (v < 0 ? '-' : '') + b.toString();
}
