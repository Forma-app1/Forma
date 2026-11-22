import 'dart:convert';

// صنف أكل. u: g = القيم لكل 100 جم، pc = للحبة، sp = للملعقة.
class Food {
  final String fid, n, cat, u;
  final num k, p, c, f;
  final String? store;
  final bool est;
  const Food({required this.fid, required this.n, required this.cat, required this.u,
      required this.k, required this.p, required this.c, required this.f, this.store, this.est = false});

  factory Food.fromMap(Map m, {String? fid}) => Food(
        fid: fid ?? (m['fid'] ?? '') as String,
        n: (m['n'] ?? 'صنف') as String,
        cat: (m['cat'] ?? 'أكلاتي') as String,
        u: (m['u'] ?? 'pc') as String,
        k: (m['k'] ?? 0) as num, p: (m['p'] ?? 0) as num,
        c: (m['c'] ?? 0) as num, f: (m['f'] ?? 0) as num,
        store: m['store'] as String?,
      );

  double factor(num amt) => u == 'g' ? amt / 100 : amt.toDouble();
  Macros macros(num amt) {
    final m = factor(amt);
    return Macros(k * m, p * m, c * m, f * m);
  }

  String get unitLabel => u == 'g' ? 'لكل 100 جم' : u == 'sp' ? 'للملعقة' : 'للحبة';
}

class Macros {
  double k, p, c, f;
  Macros([this.k = 0, this.p = 0, this.c = 0, this.f = 0]);
  void add(Macros o) { k += o.k; p += o.p; c += o.c; f += o.f; }
}

String amtLabel(Food f, num amt) {
  String n(num v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();
  if (f.u == 'g') return '${n(amt)} جم';
  if (f.u == 'sp') {
    if (amt == 0.5) return 'نص ملعقة';
    if (amt == 1) return 'ملعقة';
    if (amt == 2) return 'ملعقتين';
    return '${n(amt)} ملاعق';
  }
  if (amt == 0.5) return 'نص حبة';
  if (amt == 1) return 'حبة';
  if (amt == 2) return 'حبتين';
  return '${n(amt)} حبات';
}

// توحيد الكتابة العربية للبحث: بدون تشكيل، والألفات والتاء المربوطة والياء موحدة
String normAr(String s) {
  return s
      .toLowerCase()
      .replaceAll(RegExp('[ً-ٰٟـ]'), '')
      .replaceAll(RegExp('[أإآٱ]'), 'ا')
      .replaceAll('ة', 'ه')
      .replaceAll('ى', 'ي')
      .replaceAll('ؤ', 'و')
      .replaceAll('ئ', 'ي')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

// قاعدة الأكل: نفس ترتيب foods.js، فرقم الصنف b<index> يطابق نسخة الويب والمزامنة
class FoodDb {
  final List<Food> foods;
  final List<String> cats, rests;
  final List<String> _norm;
  FoodDb(this.foods, this.cats, this.rests) : _norm = foods.map((f) => normAr('${f.n} ${f.store ?? ''}')).toList();

  factory FoodDb.fromJson(String src) {
    final d = jsonDecode(src) as Map<String, dynamic>;
    final est = Set<String>.from(d['est'] as List);
    final estStores = Set<String>.from(d['estStores'] as List);
    final list = <Food>[];
    final raw = d['foods'] as List;
    for (var i = 0; i < raw.length; i++) {
      final r = raw[i] as List;
      final store = r[7] as String?;
      list.add(Food(
        fid: 'b$i', n: r[0] as String, cat: r[1] as String, u: r[2] as String,
        k: (r[3] ?? 0) as num, p: (r[4] ?? 0) as num, c: (r[5] ?? 0) as num, f: (r[6] ?? 0) as num,
        store: store,
        est: est.contains(r[0]) || (store != null && estStores.contains(store)),
      ));
    }
    return FoodDb(list, List<String>.from(d['cats'] as List), List<String>.from(d['rests'] as List));
  }

  Food? byFid(String fid) {
    if (!fid.startsWith('b')) return null;
    final i = int.tryParse(fid.substring(1));
    return (i != null && i >= 0 && i < foods.length) ? foods[i] : null;
  }

  // بحث بسيط: كل كلمة لازم تكون موجودة، والأولوية للي يبدأ بالكلمة
  List<Food> search(String q, {int limit = 40}) {
    final words = normAr(q).split(' ').where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return const [];
    final hits = <MapEntry<int, int>>[];
    for (var i = 0; i < foods.length; i++) {
      final t = _norm[i];
      if (!words.every((w) => t.contains(w))) continue;
      var score = 0;
      if (t.startsWith(words.first)) score -= 10;
      score += t.length ~/ 8;
      hits.add(MapEntry(i, score));
    }
    hits.sort((a, b) => a.value.compareTo(b.value));
    return hits.take(limit).map((e) => foods[e.key]).toList();
  }
}
