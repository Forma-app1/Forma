# FORMA (Flutter)

تطبيق FORMA الأصلي. المرحلة 1: الملف، اليوم (سعرات وماكروز، ماء، وزن)، تسجيل الأكل.

- البيانات بنفس شكل نسخة الويب (`forma-v2`) عشان المزامنة تشتغل بينهم.
- `assets/foods.json` يتولد من `foods.js`: `node tools/export-flutter.js`. لا تعدله يدوي.
- مجلدات android و ios تتولد في CI (`flutter create`). البناء والاختبار في `.github/workflows/flutter.yml`، والـ APK يطلع كـ artifact.

محليا: `flutter create --platforms=android,ios --org sa.forma --project-name forma . && rm test/widget_test.dart && flutter run`
