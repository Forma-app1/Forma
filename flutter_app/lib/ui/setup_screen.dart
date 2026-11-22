import 'package:flutter/material.dart';
import '../data/store.dart';
import '../logic/targets.dart';

// شاشة البداية وتعديل الملف: نفس حقول الويب (name, sex, age, h, w, tw, act, goal)
class SetupScreen extends StatefulWidget {
  final AppState state;
  final bool editing;
  const SetupScreen({super.key, required this.state, this.editing = false});
  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  late final TextEditingController name, age, h, w, tw;
  String sex = 'ذكر';
  int act = 1, goal = 0;

  @override
  void initState() {
    super.initState();
    final p = widget.state.profile ?? const <String, dynamic>{};
    String t(Object? v) => v == null ? '' : '$v';
    name = TextEditingController(text: t(p['name']));
    age = TextEditingController(text: t(p['age']));
    h = TextEditingController(text: t(p['h']));
    w = TextEditingController(text: t(p['w']));
    tw = TextEditingController(text: t(p['tw']));
    sex = (p['sex'] as String?) ?? 'ذكر';
    act = (p['act'] as num?)?.toInt() ?? 1;
    goal = (p['goal'] as num?)?.toInt() ?? 0;
  }

  @override
  void dispose() {
    for (final c in [name, age, h, w, tw]) {
      c.dispose();
    }
    super.dispose();
  }

  num? _n(TextEditingController c) => num.tryParse(c.text.trim().replaceAll(',', '.'));

  void _save() {
    final a = _n(age), hh = _n(h), ww = _n(w), t = _n(tw);
    String? err;
    if (name.text.trim().isEmpty) {
      err = 'اكتب اسمك';
    } else if (a == null || a < 13 || a > 90) {
      err = 'العمر بين 13 و 90';
    } else if (hh == null || hh < 120 || hh > 230) {
      err = 'الطول بالسنتيمتر بين 120 و 230';
    } else if (ww == null || ww < 30 || ww > 300) {
      err = 'الوزن بالكيلو بين 30 و 300';
    }
    if (err != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err)));
      return;
    }
    widget.state.setProfile({
      'name': name.text.trim(), 'sex': sex, 'age': a, 'h': hh, 'w': ww,
      'tw': (t != null && t > 0) ? t : null, 'act': act, 'goal': goal,
    });
    if (widget.editing) Navigator.of(context).pop();
  }

  Widget _field(String label, TextEditingController c, {bool number = true}) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: TextField(
          controller: c,
          keyboardType: number ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.name,
          decoration: InputDecoration(labelText: label),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Scaffold(
      appBar: widget.editing ? AppBar(title: const Text('عدّل ملفك')) : null,
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(20), children: [
          if (!widget.editing) ...[
            Text('FORMA', style: tt.headlineMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: 2)),
            const SizedBox(height: 4),
            Text('عطنا معلوماتك ونحسب لك سعراتك وبروتينك.', style: tt.bodyLarge),
            const SizedBox(height: 20),
          ],
          _field('اسمك', name, number: false),
          SegmentedButton<String>(
            segments: const [ButtonSegment(value: 'ذكر', label: Text('ذكر')), ButtonSegment(value: 'أنثى', label: Text('أنثى'))],
            selected: {sex},
            onSelectionChanged: (v) => setState(() => sex = v.first),
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: _field('العمر', age)),
            const SizedBox(width: 10),
            Expanded(child: _field('الطول (سم)', h)),
          ]),
          Row(children: [
            Expanded(child: _field('الوزن (كغ)', w)),
            const SizedBox(width: 10),
            Expanded(child: _field('الوزن المستهدف', tw)),
          ]),
          Text('نشاطك', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          for (var i = 0; i < actLevels.length; i++)
            _Pick(on: act == i, title: actLevels[i][0] as String, sub: actLevels[i][1] as String, tap: () => setState(() => act = i)),
          const SizedBox(height: 8),
          Text('هدفك', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          for (var i = 0; i < goals.length; i++)
            _Pick(on: goal == i, title: goals[i][0], sub: goals[i][1], tap: () => setState(() => goal = i)),
          const SizedBox(height: 16),
          FilledButton(onPressed: _save, child: Text(widget.editing ? 'حفظ' : 'ابدأ')),
        ]),
      ),
    );
  }
}

class _Pick extends StatelessWidget {
  final bool on;
  final String title, sub;
  final VoidCallback tap;
  const _Pick({required this.on, required this.title, required this.sub, required this.tap});
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListTile(
      onTap: tap,
      contentPadding: EdgeInsets.zero,
      title: Text(title, style: TextStyle(fontWeight: on ? FontWeight.w700 : FontWeight.w400)),
      subtitle: Text(sub),
      trailing: Icon(on ? Icons.check_circle : Icons.circle_outlined, color: on ? cs.primary : null),
    );
  }
}
