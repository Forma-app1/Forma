import 'package:flutter/material.dart';
import '../data/store.dart';
import 'setup_screen.dart';
import 'today_screen.dart';
import 'food_screen.dart';
import 'settings_screen.dart';

class Home extends StatefulWidget {
  final AppState state;
  const Home({super.key, required this.state});
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    final st = widget.state;
    if (!st.hasProfile) return SetupScreen(state: st);
    final pages = [
      TodayScreen(state: st, goFood: () => setState(() => tab = 1)),
      FoodScreen(state: st),
      const _Soon(title: 'التمرين', text: 'البرامج وتسجيل المجموعات جاية في المرحلة الثانية.'),
      const _Soon(title: 'التقدم', text: 'رسم الوزن وأقوى أرقامك جاية في المرحلة الثانية.'),
      SettingsScreen(state: st),
    ];
    return Scaffold(
      body: SafeArea(child: IndexedStack(index: tab, children: pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.today_outlined), selectedIcon: Icon(Icons.today), label: 'اليوم'),
          NavigationDestination(icon: Icon(Icons.restaurant_outlined), selectedIcon: Icon(Icons.restaurant), label: 'الأكل'),
          NavigationDestination(icon: Icon(Icons.fitness_center_outlined), selectedIcon: Icon(Icons.fitness_center), label: 'التمرين'),
          NavigationDestination(icon: Icon(Icons.show_chart), label: 'التقدم'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'ملفي'),
        ],
      ),
    );
  }
}

class _Soon extends StatelessWidget {
  final String title, text;
  const _Soon({required this.title, required this.text});
  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(text, textAlign: TextAlign.center),
          ]),
        ),
      );
}
