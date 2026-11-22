import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'data/food.dart';
import 'data/store.dart';
import 'ui/theme.dart';
import 'ui/home.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final db = FoodDb.fromJson(await rootBundle.loadString('assets/foods.json'));
  final state = await AppState.load(db);
  runApp(FormaApp(state: state));
}

class FormaApp extends StatelessWidget {
  final AppState state;
  const FormaApp({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FORMA',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: formaTheme(Brightness.light),
      darkTheme: formaTheme(Brightness.dark),
      home: ListenableBuilder(
        listenable: state,
        builder: (context, _) => Home(state: state),
      ),
    );
  }
}
