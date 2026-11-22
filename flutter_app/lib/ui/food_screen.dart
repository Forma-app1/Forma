import 'package:flutter/material.dart';
import '../data/food.dart';
import '../data/store.dart';
import 'theme.dart';

class FoodScreen extends StatefulWidget {
  final AppState state;
  const FoodScreen({super.key, required this.state});
  @override
  State<FoodScreen> createState() => _FoodScreenState();
}

class _FoodScreenState extends State<FoodScreen> {
  final q = TextEditingController();
  String? cat;

  @override
  void dispose() {
    q.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final st = widget.state, db = st.db;
    final text = q.text.trim();
    final List<Food> list;
    final String head;
    if (text.isNotEmpty) {
      list = db.search(text);
      head = list.isEmpty ? 'ما لقينا شي. جرّب كلمة ثانية' : 'النتائج';
    } else if (cat != null) {
      list = db.foods.where((f) => f.cat == cat).toList();
      head = cat!;
    } else {
      list = st.recentFoods;
      head = list.isEmpty ? '' : 'أكلت مؤخرا';
    }
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: TextField(
          controller: q,
          onChanged: (_) => setState(() {}),
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            hintText: 'وش أكلت؟ مثلا: كبسة دجاج',
            prefixIcon: const Icon(Icons.search),
            suffixIcon: text.isEmpty ? null : IconButton(icon: const Icon(Icons.close), onPressed: () => setState(q.clear)),
          ),
        ),
      ),
      if (text.isEmpty)
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              for (final c in db.cats)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(c),
                    selected: cat == c,
                    onSelected: (on) => setState(() => cat = on ? c : null),
                  ),
                ),
            ],
          ),
        ),
      Expanded(
        child: ListView(padding: const EdgeInsets.fromLTRB(16, 8, 16, 24), children: [
          if (head.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(head, style: TextStyle(color: muted(context), fontWeight: FontWeight.w700)),
            ),
          if (text.isEmpty && cat == null && list.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 40),
              child: Text('اكتب اسم الأكلة فوق، أو اختر قسم.', textAlign: TextAlign.center),
            ),
          for (final f in list)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(f.n),
              subtitle: Text('${f.store != null && db.rests.contains(f.store) ? '${f.store} · ' : ''}${fmt(f.k)} سعرة ${f.unitLabel}${f.est ? ' · تقديري' : ''}'),
              trailing: const Icon(Icons.add_circle_outline),
              onTap: () => showAddSheet(context, st, f),
            ),
        ]),
      ),
    ]);
  }
}

String defaultMeal() {
  final h = DateTime.now().hour;
  if (h < 11) return 'فطور';
  if (h < 16) return 'غداء';
  if (h < 21) return 'عشاء';
  return 'سناك';
}

Future<void> showAddSheet(BuildContext context, AppState st, Food f) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (ctx) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
      child: _AddSheet(state: st, food: f),
    ),
  );
}

class _AddSheet extends StatefulWidget {
  final AppState state;
  final Food food;
  const _AddSheet({required this.state, required this.food});
  @override
  State<_AddSheet> createState() => _AddSheetState();
}

class _AddSheetState extends State<_AddSheet> {
  late num amt;
  late final TextEditingController c;
  String meal = defaultMeal();

  @override
  void initState() {
    super.initState();
    final f = widget.food;
    amt = f.u == 'g' ? (widget.state.lastAmt(f) ?? 100) : 1;
    c = TextEditingController(text: _s(amt));
  }

  @override
  void dispose() {
    c.dispose();
    super.dispose();
  }

  String _s(num v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();

  void _set(num v) => setState(() {
        amt = v;
        c.text = _s(v);
      });

  @override
  Widget build(BuildContext context) {
    final f = widget.food, m = f.macros(amt);
    final quick = f.u == 'g' ? const [50, 100, 150, 200, 300] : const [0.5, 1, 2, 3];
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(f.n, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
        if (f.est) Text('القيم تقديرية', style: TextStyle(color: muted(context), fontSize: 12)),
        const SizedBox(height: 14),
        TextField(
          controller: c,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: 'الكمية', suffixText: f.u == 'g' ? 'جم' : f.u == 'sp' ? 'ملعقة' : 'حبة'),
          onChanged: (v) => setState(() => amt = num.tryParse(v.trim().replaceAll(',', '.')) ?? 0),
        ),
        const SizedBox(height: 8),
        Wrap(spacing: 6, children: [
          for (final v in quick) ActionChip(label: Text(amtLabel(f, v)), onPressed: () => _set(v)),
        ]),
        const SizedBox(height: 12),
        SegmentedButton<String>(
          segments: [for (final x in meals) ButtonSegment(value: x, label: Text(x))],
          selected: {meal},
          showSelectedIcon: false,
          onSelectionChanged: (v) => setState(() => meal = v.first),
        ),
        const SizedBox(height: 14),
        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
          _V('سعرة', m.k), _V('بروتين', m.p), _V('كارب', m.c), _V('دهون', m.f),
        ]),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: amt > 0
              ? () async {
                  final nav = Navigator.of(context), sm = ScaffoldMessenger.of(context);
                  await widget.state.addFood(f, amt, meal);
                  nav.pop();
                  sm.showSnackBar(SnackBar(content: Text('انضاف ${f.n}')));
                }
              : null,
          child: const Text('أضف'),
        ),
      ]),
    );
  }
}

class _V extends StatelessWidget {
  final String l;
  final double v;
  const _V(this.l, this.v);
  @override
  Widget build(BuildContext context) => Column(children: [
        Text(fmt(v), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        Text(l, style: TextStyle(color: muted(context), fontSize: 12)),
      ]);
}
