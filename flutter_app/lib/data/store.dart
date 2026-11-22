import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'food.dart';
import '../logic/targets.dart';

// كل بيانات المستخدم في كائن واحد بنفس شكل S في نسخة الويب:
// profile, days{YYYY-MM-DD:{food:[{fid,amt,meal}|{x,amt,meal}], weight, water}}, recent, custom, adj, _ts
// نفس الشكل يخلي المزامنة مع Supabase (sync_pull/sync_push) تشتغل بين الويب والتطبيق.
const storeKey = 'forma-v2';
const meals = ['فطور', 'غداء', 'عشاء', 'سناك'];

String dayKey(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

class AppState extends ChangeNotifier {
  final FoodDb db;
  final SharedPreferences prefs;
  Map<String, dynamic> s;

  AppState(this.db, this.prefs, this.s) {
    _normalize();
  }

  static Future<AppState> load(FoodDb db) async {
    final prefs = await SharedPreferences.getInstance();
    Map<String, dynamic> s = {};
    final raw = prefs.getString(storeKey);
    if (raw != null) {
      try {
        final d = jsonDecode(raw);
        if (d is Map<String, dynamic>) s = d;
      } catch (_) {}
    }
    return AppState(db, prefs, s);
  }

  void _normalize() {
    s['days'] = (s['days'] as Map?)?.cast<String, dynamic>() ?? <String, dynamic>{};
    s['recent'] = (s['recent'] as List?) ?? <dynamic>[];
    s['custom'] = (s['custom'] as List?) ?? <dynamic>[];
    s['adj'] = (s['adj'] as num?) ?? 0;
  }

  Future<void> save() async {
    s['_ts'] = DateTime.now().millisecondsSinceEpoch;
    await prefs.setString(storeKey, jsonEncode(s));
    notifyListeners();
  }

  Map<String, dynamic>? get profile => (s['profile'] as Map?)?.cast<String, dynamic>();
  bool get hasProfile => profile != null;
  Map<String, dynamic> get days => s['days'] as Map<String, dynamic>;
  String get today => dayKey(DateTime.now());

  Map<String, dynamic> day(String k) {
    final d = days[k];
    if (d is Map<String, dynamic>) {
      d['food'] ??= <dynamic>[];
      return d;
    }
    final n = <String, dynamic>{'food': <dynamic>[], 'weight': null};
    days[k] = n;
    return n;
  }

  Targets get targets => computeTargets(profile ?? const {}, adj: (s['adj'] as num?) ?? 0);

  Food foodOf(Map e) {
    final x = e['x'];
    if (x is Map) return Food.fromMap(x, fid: '');
    final fid = e['fid'];
    if (fid is String) {
      if (fid.startsWith('b')) {
        final f = db.byFid(fid);
        if (f != null) return f;
      } else if (fid.startsWith('c')) {
        final i = int.tryParse(fid.substring(1));
        final custom = s['custom'] as List;
        if (i != null && i >= 0 && i < custom.length && custom[i] is Map) {
          return Food.fromMap(custom[i] as Map, fid: fid);
        }
      }
    }
    return const Food(fid: '', n: 'صنف محذوف', cat: '', u: 'pc', k: 0, p: 0, c: 0, f: 0);
  }

  List<Map> foodEntries(String k) =>
      ((days[k] as Map?)?['food'] as List? ?? const []).whereType<Map>().toList();

  Macros totals(String k) {
    final t = Macros();
    for (final e in foodEntries(k)) {
      t.add(foodOf(e).macros((e['amt'] ?? 0) as num));
    }
    return t;
  }

  List<Food> get recentFoods => (s['recent'] as List)
      .whereType<String>()
      .map((fid) => foodOf({'fid': fid}))
      .where((f) => f.fid.isNotEmpty)
      .toList();

  num? lastAmt(Food f) => ((s['lastAmt'] as Map?)?[f.fid]) as num?;

  Future<void> addFood(Food f, num amt, String meal, {String? k}) async {
    final key = k ?? today;
    (day(key)['food'] as List).add({'fid': f.fid, 'amt': amt, 'meal': meal});
    final r = (s['recent'] as List)..remove(f.fid);
    r.insert(0, f.fid);
    if (r.length > 12) r.removeRange(12, r.length);
    if (f.u == 'g') {
      final la = (s['lastAmt'] as Map?)?.cast<String, dynamic>() ?? <String, dynamic>{};
      la[f.fid] = amt;
      s['lastAmt'] = la;
    }
    await save();
  }

  Future<void> removeFood(String k, Map entry) async {
    (day(k)['food'] as List).remove(entry);
    await save();
  }

  int water(String k) => ((days[k] as Map?)?['water'] as num?)?.toInt() ?? 0;
  Future<void> setWater(String k, int n) async {
    day(k)['water'] = n < 0 ? 0 : n;
    await save();
  }

  num? weightOn(String k) => (days[k] as Map?)?['weight'] as num?;
  Future<void> setWeight(String k, num? w) async {
    day(k)['weight'] = w;
    await save();
  }

  // آخر وزن مسجل، وإذا ما فيه نرجع لوزن الملف
  num get currentWeight {
    final ks = days.keys.toList()..sort();
    for (final k in ks.reversed) {
      final w = weightOn(k);
      if (w != null && w > 0) return w;
    }
    return (profile?['w'] as num?) ?? 70;
  }

  int get waterGoal => (currentWeight * 35 / 250).round().clamp(6, 16);

  Future<void> setProfile(Map<String, dynamic> p) async {
    final old = profile ?? const {};
    p['start'] = old['start'] ?? today;
    p['startW'] = old['startW'] ?? p['w'];
    if (old['macro'] != null) p['macro'] = old['macro'];
    if (old['customKcal'] != null) p['customKcal'] = old['customKcal'];
    s['profile'] = p;
    await save();
  }

  Future<void> wipe() async {
    s = {'_wiped': true};
    _normalize();
    await save();
  }
}
