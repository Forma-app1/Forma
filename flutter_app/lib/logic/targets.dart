// نفس معادلات app.js (targets) حرفيا، عشان الأرقام تطابق نسخة الويب.
// الطاقة: Mifflin-St Jeor × النشاط. خسارة: عجز 20% محصور بين 0.5% و1% من الوزن أسبوعيا.
// زيادة: فائض 10% بحد 350. البروتين 1.6 جم/كغ (وزن مرجعي عند BMI 30 وفوق). الدهون 25% وما تقل عن 0.6 جم/كغ.
import 'dart:math' as math;

const actLevels = [
  ['خامل', 'شغل مكتبي، بدون رياضة', 1.2],
  ['خفيف', 'تمرين 1-3 أيام', 1.375],
  ['متوسط', 'تمرين 3-5 أيام', 1.55],
  ['عالي', 'تمرين 6-7 أيام أو شغل بدني', 1.725],
];
const goals = [
  ['خسارة دهون', 'نزول 0.5-1% بالأسبوع'],
  ['ثبات', 'تحافظ على وزنك'],
  ['زيادة عضل', 'زيادة بطيئة ونظيفة'],
];

class Targets {
  final int kcal, p, c, f, tdee, bmr;
  const Targets(this.kcal, this.p, this.c, this.f, this.tdee, this.bmr);
}

int jsRound(num n) => (n + 0.5).floor();
int r5(num n) => jsRound(n / 5) * 5;
num clampN(num v, num a, num b) => math.min(math.max(v, a), b);

Targets computeTargets(Map<String, dynamic> p, {num adj = 0}) {
  final num w = (p['w'] ?? 70) as num;
  final num h = (p['h'] ?? 170) as num;
  final num age = (p['age'] ?? 25) as num;
  final bool female = p['sex'] == 'أنثى';
  final int act = ((p['act'] ?? 1) as num).toInt().clamp(0, 3);
  final int goal = ((p['goal'] ?? 1) as num).toInt();
  final hM = h / 100, bmi = w / (hM * hM), ref = bmi >= 30 ? 27 * hM * hM : w;
  final bmr = 10 * w + 6.25 * h - 5 * age + (female ? -161 : 5);
  final tdee = bmr * (actLevels[act][2] as double);
  num kcal = tdee;
  if (goal == 0) {
    kcal = tdee - clampN(0.2 * tdee, 0.005 * w * 1100, 0.01 * w * 1100);
  } else if (goal == 2) {
    kcal = tdee + math.min(0.1 * tdee, 350);
  }
  final custom = p['customKcal'];
  if (custom is num && custom > 0) kcal = custom;
  kcal += adj;
  kcal = math.max(kcal, female ? 1200 : 1500);
  final int k = jsRound(kcal / 50) * 50;
  int pr = r5(1.6 * ref);
  int fat = r5(math.max(0.25 * k / 9, 0.6 * w));
  int carb = math.max(0, r5((k - pr * 4 - fat * 9) / 4));
  final m = p['macro'];
  if (m is Map && m['p'] is num && m['c'] is num && m['f'] is num &&
      (m['p'] as num) + (m['c'] as num) + (m['f'] as num) == 100) {
    pr = r5(k * (m['p'] as num) / 400);
    carb = r5(k * (m['c'] as num) / 400);
    fat = r5(k * (m['f'] as num) / 900);
  }
  return Targets(k, pr, carb, fat, jsRound(tdee), jsRound(bmr));
}
