import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:forma/data/food.dart';
import 'package:forma/logic/targets.dart';

void main() {
  // القيم المتوقعة محسوبة من دالة targets في app.js لنفس الملف
  test('targets match web app', () {
    final a = computeTargets({'sex': 'ذكر', 'age': 22, 'h': 175, 'w': 80, 'act': 2, 'goal': 0});
    expect([a.kcal, a.p, a.c, a.f, a.tdee], [2200, 130, 285, 60, 2773]);
    final b = computeTargets({'sex': 'أنثى', 'age': 30, 'h': 160, 'w': 85, 'act': 1, 'goal': 2});
    expect([b.kcal, b.p, b.c, b.f, b.tdee], [2350, 110, 330, 65, 2116]);
  });

  test('custom macro split', () {
    final t = computeTargets({'sex': 'ذكر', 'age': 22, 'h': 175, 'w': 80, 'act': 2, 'goal': 0, 'macro': {'p': 30, 'c': 40, 'f': 30}});
    expect([t.p, t.c, t.f], [165, 220, 75]);
  });

  final db = FoodDb.fromJson(File('assets/foods.json').readAsStringSync());

  test('food ids keep web order', () {
    expect(db.byFid('b0')!.n, 'رز أبيض مطبوخ');
    expect(db.foods.length, greaterThan(800));
    for (var i = 0; i < db.foods.length; i++) {
      expect(db.foods[i].fid, 'b$i');
    }
  });

  test('arabic search', () {
    expect(db.search('كبسه دجاج').first.n, 'كبسة دجاج');
    expect(db.search('رز').isNotEmpty, true);
    expect(db.search('zzzz'), isEmpty);
  });

  test('macros per unit', () {
    final rice = db.byFid('b0')!;
    expect(rice.macros(200).k, closeTo(260, 0.01));
    expect(amtLabel(rice, 150), '150 جم');
  });
}
