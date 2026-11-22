import 'package:flutter/material.dart';
import '../data/store.dart';
import '../logic/targets.dart';
import 'setup_screen.dart';
import 'theme.dart';

class SettingsScreen extends StatefulWidget {
  final AppState state;
  const SettingsScreen({super.key, required this.state});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool armed = false;

  @override
  Widget build(BuildContext context) {
    final st = widget.state, p = st.profile ?? const <String, dynamic>{}, g = st.targets;
    final tt = Theme.of(context).textTheme;
    final goal = ((p['goal'] as num?) ?? 1).toInt().clamp(0, 2);
    return ListView(padding: const EdgeInsets.fromLTRB(16, 12, 16, 24), children: [
      Text('ملفي', style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
      Text('${p['name'] ?? ''} · ${st.currentWeight} كغ · ${goals[goal][0]}', style: TextStyle(color: muted(context))),
      const SizedBox(height: 10),
      Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('أهدافك اليومية', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
              _N('سعرة', g.kcal), _N('بروتين', g.p), _N('كارب', g.c), _N('دهون', g.f),
            ]),
            const SizedBox(height: 10),
            Text('حرقك اليومي ${fmt(g.tdee)} سعرة بمعادلة Mifflin-St Jeor.', style: TextStyle(color: muted(context), fontSize: 13)),
          ]),
        ),
      ),
      Card(
        child: ListTile(
          leading: const Icon(Icons.edit_outlined),
          title: const Text('عدّل ملفك'),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => SetupScreen(state: st, editing: true))),
        ),
      ),
      Card(
        child: ListTile(
          leading: const Icon(Icons.delete_forever_outlined),
          title: Text(armed ? 'متأكد؟ اضغط مرة ثانية للمسح' : 'امسح كل البيانات'),
          onTap: () {
            if (!armed) {
              setState(() => armed = true);
              return;
            }
            armed = false;
            st.wipe();
          },
        ),
      ),
      const SizedBox(height: 12),
      Center(child: Text('FORMA · نسخة التطبيق 0.1', style: TextStyle(color: muted(context), fontSize: 12))),
    ]);
  }
}

class _N extends StatelessWidget {
  final String l;
  final int v;
  const _N(this.l, this.v);
  @override
  Widget build(BuildContext context) => Column(children: [
        Text(fmt(v), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
        Text(l, style: TextStyle(color: muted(context), fontSize: 12)),
      ]);
}
