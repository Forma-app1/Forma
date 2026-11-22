import 'package:flutter/material.dart';
import '../data/food.dart';
import '../data/store.dart';
import 'theme.dart';

class TodayScreen extends StatelessWidget {
  final AppState state;
  final VoidCallback goFood;
  const TodayScreen({super.key, required this.state, required this.goFood});

  @override
  Widget build(BuildContext context) {
    final st = state, k = st.today, g = st.targets, t = st.totals(k);
    final tt = Theme.of(context).textTheme;
    final left = g.kcal - t.k;
    final hour = DateTime.now().hour;
    final greet = hour < 12 ? 'صباح الخير' : 'مساء الخير';
    return ListView(padding: const EdgeInsets.fromLTRB(16, 12, 16, 24), children: [
      Text('$greet ${st.profile?['name'] ?? ''}', style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
      const SizedBox(height: 10),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(left >= 0 ? 'باقي لك' : 'زدت', style: tt.bodyMedium?.copyWith(color: muted(context))),
            Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(fmt(left.abs()), style: tt.displayMedium?.copyWith(fontWeight: FontWeight.w800, height: 1)),
              const SizedBox(width: 6),
              Padding(padding: const EdgeInsets.only(bottom: 6), child: Text('سعرة من ${fmt(g.kcal)}')),
            ]),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(value: g.kcal > 0 ? (t.k / g.kcal).clamp(0.0, 1.0) : 0, minHeight: 10),
            ),
            const SizedBox(height: 16),
            Row(children: [
              _Macro('بروتين', t.p, g.p, FC.protein),
              _Macro('كارب', t.c, g.c, FC.carb),
              _Macro('دهون', t.f, g.f, FC.fat),
            ]),
          ]),
        ),
      ),
      Row(children: [
        Expanded(child: _WeightCard(state: st)),
        const SizedBox(width: 10),
        Expanded(child: _WaterCard(state: st)),
      ]),
      const SizedBox(height: 6),
      for (final m in meals) _MealCard(state: st, meal: m),
      const SizedBox(height: 8),
      FilledButton.icon(onPressed: goFood, icon: const Icon(Icons.add), label: const Text('سجّل أكل')),
    ]);
  }
}

class _Macro extends StatelessWidget {
  final String label;
  final double v;
  final int goal;
  final Color color;
  const _Macro(this.label, this.v, this.goal, this.color);
  @override
  Widget build(BuildContext context) {
    final left = goal - v;
    return Expanded(
      child: Padding(
        padding: const EdgeInsetsDirectional.only(end: 10),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(color: muted(context), fontSize: 12)),
          Text(left >= 0 ? 'باقي ${fmt(left)} جم' : 'زاد ${fmt(-left)} جم', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(value: goal > 0 ? (v / goal).clamp(0.0, 1.0) : 0, color: color, minHeight: 6),
          ),
        ]),
      ),
    );
  }
}

class _WaterCard extends StatelessWidget {
  final AppState state;
  const _WaterCard({required this.state});
  @override
  Widget build(BuildContext context) {
    final k = state.today, n = state.water(k), g = state.waterGoal;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('الماء', style: TextStyle(color: muted(context))),
          Text('$n من $g أكواب', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 8),
          Row(children: [
            IconButton.filledTonal(
              onPressed: n > 0 ? () => state.setWater(k, n - 1) : null,
              icon: const Icon(Icons.remove), tooltip: 'شيل كوب'),
            const SizedBox(width: 6),
            Expanded(
              child: FilledButton.icon(
                style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
                onPressed: () {
                  state.setWater(k, n + 1);
                  if (n + 1 == g) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('كمّلت هدف الماء اليوم')));
                  }
                },
                icon: const Icon(Icons.water_drop_outlined, size: 18), label: const Text('كوب')),
            ),
          ]),
        ]),
      ),
    );
  }
}

class _WeightCard extends StatelessWidget {
  final AppState state;
  const _WeightCard({required this.state});

  Future<void> _edit(BuildContext context) async {
    final c = TextEditingController(text: (state.weightOn(state.today) ?? '').toString());
    final v = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('وزنك اليوم'),
        content: TextField(
          controller: c, autofocus: true,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(suffixText: 'كغ'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(80, 40)),
            onPressed: () => Navigator.pop(ctx, c.text), child: const Text('حفظ')),
        ],
      ),
    );
    if (v == null) return;
    final w = num.tryParse(v.trim().replaceAll(',', '.'));
    if (w != null && w >= 30 && w <= 300) await state.setWeight(state.today, w);
  }

  @override
  Widget build(BuildContext context) {
    final w = state.weightOn(state.today);
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () => _edit(context),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('الوزن', style: TextStyle(color: muted(context))),
            Text(w == null ? 'سجّل وزنك' : '$w كغ', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 8),
            Text(w == null ? 'اضغط هنا' : 'اضغط للتعديل', style: TextStyle(color: muted(context), fontSize: 12)),
            const SizedBox(height: 14),
          ]),
        ),
      ),
    );
  }
}

class _MealCard extends StatelessWidget {
  final AppState state;
  final String meal;
  const _MealCard({required this.state, required this.meal});
  @override
  Widget build(BuildContext context) {
    final k = state.today;
    final items = state.foodEntries(k).where((e) => e['meal'] == meal).toList();
    if (items.isEmpty) return const SizedBox.shrink();
    final sum = Macros();
    for (final e in items) {
      sum.add(state.foodOf(e).macros((e['amt'] ?? 0) as num));
    }
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(meal, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const Spacer(),
            Text('${fmt(sum.k)} سعرة', style: TextStyle(color: muted(context))),
          ]),
          for (final e in items)
            Dismissible(
              key: ObjectKey(e),
              direction: DismissDirection.endToStart,
              background: Container(alignment: AlignmentDirectional.centerEnd, padding: const EdgeInsets.all(12), child: const Icon(Icons.delete_outline)),
              onDismissed: (_) => state.removeFood(k, e),
              child: _EntryRow(food: state.foodOf(e), amt: (e['amt'] ?? 0) as num),
            ),
        ]),
      ),
    );
  }
}

class _EntryRow extends StatelessWidget {
  final Food food;
  final num amt;
  const _EntryRow({required this.food, required this.amt});
  @override
  Widget build(BuildContext context) {
    final m = food.macros(amt);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(food.n, maxLines: 2, overflow: TextOverflow.ellipsis),
            Text('${amtLabel(food, amt)} · ${fmt(m.p)} بروتين${food.est ? ' · تقديري' : ''}',
                style: TextStyle(color: muted(context), fontSize: 12)),
          ]),
        ),
        Text(fmt(m.k), style: const TextStyle(fontWeight: FontWeight.w700)),
      ]),
    );
  }
}
